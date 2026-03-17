import { useEffect, useRef, useState, useCallback } from "react";
import { Application, HTMLText } from "pixi.js";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Slider,
  Stack,
  Chip,
} from "@mui/material";
import { Bot } from "./Bot";
import { Health } from "./Health";
import { Cover } from "./Cover";
import { EntityManager } from "./EntityManager";
import { ARENA_WIDTH, ARENA_HEIGHT } from "./config";
import type { TrainingMetrics } from "./DQNAgent";

interface Stats {
  fps: number;
  epsilon: number;
  loss: number;
  averageReward: number;
  memorySize: number;
  totalSteps: number;
  episodes: number;
}

export default function Sandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<Application | null>(null);
  const managerRef = useRef<EntityManager | null>(null);
  const initializedRef = useRef(false);
  const pausedRef = useRef(false);
  const speedRef = useRef(1);

  const [stats, setStats] = useState<Stats>({
    fps: 0,
    epsilon: 1,
    loss: 0,
    averageReward: 0,
    memorySize: 0,
    totalSteps: 0,
    episodes: 0,
  });

  const [botCount, setBotCount] = useState(5);
  const [isPaused, setIsPaused] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const [isStarted, setIsStarted] = useState(false);
  const [isAppInitialized, setIsAppInitialized] = useState(false);

  // Обновление статистики
  const updateStats = useCallback(() => {
    if (!managerRef.current) return;

    const bots = managerRef.current.bots;
    if (bots.length > 0) {
      const agent = bots[0].agent;
      const metrics = agent.getMetrics();

      setStats((prev) => ({
        ...prev,
        epsilon: metrics.epsilon,
        loss: metrics.loss,
        averageReward: metrics.averageReward,
        memorySize: agent.getMemorySize(),
        totalSteps: metrics.totalSteps,
        episodes: metrics.episodes,
      }));
    }
  }, []);

  // Интервал обновления статистики (раз в секунду)
  useEffect(() => {
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, [updateStats]);

  // Инициализация приложения
  useEffect(() => {
    let app: Application | null = null;
    let tickerHandler: (() => void) | null = null;
    let manager: EntityManager | null = null;

    const initApp = async () => {
      if (!canvasRef.current || initializedRef.current) return;

      app = new Application();
      appRef.current = app;

      await app.init({
        canvas: canvasRef.current,
        background: "#222",
        antialias: true,
        width: ARENA_WIDTH,
        height: ARENA_HEIGHT,
      });

      initializedRef.current = true;
      setIsAppInitialized(true);

      manager = new EntityManager();
      managerRef.current = manager;
      manager.setApp(app);

      // FPS текст на канвасе
      const fpsText = new HTMLText({
        text: "FPS: 0",
        style: {
          fontSize: 14,
          fill: "#00ff00",
          fontWeight: "bold",
        },
      });
      fpsText.position.set(10, 10);
      app.stage.addChild(fpsText);

      // Ticker handler
      let accumulator = 0;
      tickerHandler = () => {
        if (pausedRef.current) return;

        const delta = app!.ticker.deltaMS / 16.666;
        accumulator += delta * speedRef.current;

        // Обновляем FPS
        fpsText.text = "FPS: " + Math.round(app!.ticker.FPS);

        // Фиксированный шаг времени для стабильности физики
        const fixedDelta = 1;
        while (accumulator >= fixedDelta) {
          manager!.update(fixedDelta);
          accumulator -= fixedDelta;
        }
      };

      app.ticker.add(tickerHandler);
    };

    initApp();

    // Cleanup function - возвращается напрямую из useEffect
    return () => {
      // if (tickerHandler && app) {
      //   app.ticker.remove(tickerHandler);
      // }
      // if (app) {
      //   app.destroy(true, { children: true });
      // }
      // managerRef.current = null;
      // appRef.current = null;
      // initializedRef.current = false;
      // setIsAppInitialized(false);
      // setIsStarted(false);
    };
  }, []);

  // Старт симуляции
  const handleStart = useCallback(() => {
    if (!managerRef.current || !appRef.current || isStarted) return;

    const manager = managerRef.current;
    const app = appRef.current;

    manager.setBotCount(botCount);

    // Добавляем укрытия
    // Неразрушимые укрытия (синие, больше размером)
    const indestructibleCoversData = [
      { x: 200, y: 150 },
      { x: 600, y: 150 },
      { x: 300, y: 450 },
    ];

    for (const coverData of indestructibleCoversData) {
      const cover = new Cover()
        .setPosition(coverData.x, coverData.y)
        .setType("indestructible")
        .draw();
      app.stage.addChild(cover);
      manager.addCover(cover);
    }

    // Разрушимые укрытия (красные, меньше размером)
    const destructibleCoversData = [
      { x: 400, y: 300 },
      { x: 500, y: 450 },
      { x: 150, y: 300 },
    ];

    for (const coverData of destructibleCoversData) {
      const cover = new Cover()
        .setPosition(coverData.x, coverData.y)
        .setType("destructible")
        .draw();
      app.stage.addChild(cover);
      manager.addCover(cover);
    }

    // Добавляем аптечки
    for (let i = 0; i < 5; i++) {
      const item = new Health();
      item.setPosition(100 * i + 20, 200).draw();
      manager.addItem(item);
      app.stage.addChild(item);
    }

    setIsStarted(true);
  }, [botCount, isStarted]);

  // Синхронизация botCount во время работы
  useEffect(() => {
    if (managerRef.current && isStarted) {
      managerRef.current.setBotCount(botCount);
    }
  }, [botCount, isStarted]);

  // Синхронизация paused
  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  // Синхронизация timeScale
  useEffect(() => {
    speedRef.current = timeScale;
  }, [timeScale]);

  const handlePause = () => setIsPaused(!isPaused);

  const handleReset = () => {
    if (!managerRef.current || !appRef.current || !isStarted) return;

    // Очищаем всех ботов
    while (managerRef.current.bots.length > 0) {
      managerRef.current.removeBot(managerRef.current.bots[0]);
    }

    // Сбрасываем счётчик шагов
    Bot.globalStep = 0;

    // Пересоздаём ботов
    managerRef.current.setBotCount(botCount);
  };

  const handleExportModel = () => {
    if (!managerRef.current || managerRef.current.bots.length === 0) return;

    const agent = managerRef.current.bots[0].agent;
    const json = agent.exportWeights();

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `model-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportModel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !managerRef.current || managerRef.current.bots.length === 0)
      return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const agent = managerRef.current!.bots[0].agent;
        agent.importWeights(json);
      } catch (err) {
        console.error("Ошибка импорта модели:", err);
        alert("Ошибка импорта модели");
      }
    };
    reader.readAsText(file);
  };

  const handleSaveModel = async () => {
    if (!managerRef.current || managerRef.current.bots.length === 0) return;

    try {
      const agent = managerRef.current.bots[0].agent;
      await agent.saveModel("rl_bot_model");
      alert("Модель сохранена в IndexedDB");
    } catch (err) {
      console.error("Ошибка сохранения:", err);
      alert("Ошибка сохранения модели");
    }
  };

  const handleLoadModel = async () => {
    if (!managerRef.current || managerRef.current.bots.length === 0) return;

    try {
      const agent = managerRef.current.bots[0].agent;
      await agent.loadModel("rl_bot_model");
      alert("Модель загружена из IndexedDB");
    } catch (err) {
      console.error("Ошибка загрузки:", err);
      alert("Модель не найдена в IndexedDB");
    }
  };

  return (
    <Box
      height="100%"
      display="flex"
      flexDirection="row"
      gap={2}
      p={2}
      sx={{ overflow: "hidden" }}
    >
      {/* Основная панель */}
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h6" gutterBottom>
          RLU Bot Sandbox
        </Typography>
        <canvas ref={canvasRef} style={{ borderRadius: 8 }} />

        {/* Кнопка Start */}
        {!isStarted && (
          <Stack direction="row" spacing={2} mt={2}>
            <Button
              variant="contained"
              size="large"
              onClick={handleStart}
              disabled={!isAppInitialized}
              color="success"
            >
              Start Simulation
            </Button>
          </Stack>
        )}

        {/* Контроллеры */}
        {isStarted && (
          <>
            <Stack direction="row" spacing={2} mt={2} alignItems="center">
              <Button
                variant="contained"
                onClick={handlePause}
                color={isPaused ? "warning" : "success"}
              >
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Button variant="outlined" onClick={handleReset} color="error">
                Reset
              </Button>

              <Box width={150}>
                <Typography variant="caption">Speed: {timeScale}x</Typography>
                <Slider
                  value={timeScale}
                  min={1}
                  max={10}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_, v) => setTimeScale(v as number)}
                  sx={{ mt: 1 }}
                />
              </Box>

              <Box width={150}>
                <Typography variant="caption">Bots: {botCount}</Typography>
                <Slider
                  value={botCount}
                  min={1}
                  max={20}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_, v) => setBotCount(v as number)}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Stack>

            {/* Кнопки работы с моделями */}
            <Stack direction="row" spacing={2} mt={2}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleExportModel}
              >
                Export Model
              </Button>
              <Button variant="outlined" size="small" component="label">
                Import Model
                <input
                  type="file"
                  hidden
                  accept=".json"
                  onChange={handleImportModel}
                />
              </Button>
              <Button variant="outlined" size="small" onClick={handleSaveModel}>
                Save to DB
              </Button>
              <Button variant="outlined" size="small" onClick={handleLoadModel}>
                Load from DB
              </Button>
            </Stack>
          </>
        )}
      </Box>

      {/* Панель статистики */}
      <Paper
        sx={{
          p: 2,
          minWidth: 280,
          height: "fit-content",
          maxHeight: "100%",
          overflow: "auto",
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Statistics
        </Typography>

        <Grid container spacing={1}>
          <Grid size={12}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                FPS
              </Typography>
              <Chip
                label={stats.fps}
                size="small"
                color={
                  stats.fps >= 55
                    ? "success"
                    : stats.fps >= 30
                      ? "warning"
                      : "error"
                }
              />
            </Box>
          </Grid>

          <Grid size={12}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Epsilon
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {stats.epsilon.toFixed(4)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={12}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Loss
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="error">
                {stats.loss.toFixed(6)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={12}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Avg Reward
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                color={stats.averageReward >= 0 ? "success" : "error"}
              >
                {stats.averageReward.toFixed(4)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={12}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Memory
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {stats.memorySize}
              </Typography>
            </Box>
          </Grid>

          <Grid size={12}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Total Steps
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {stats.totalSteps.toLocaleString()}
              </Typography>
            </Box>
          </Grid>

          <Grid size={12}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Episodes
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {stats.episodes}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="subtitle2" fontWeight="bold" mt={2} mb={1}>
          Info
        </Typography>
        <Typography variant="caption" display="block">
          Target Network: Enabled
        </Typography>
        <Typography variant="caption" display="block">
          Update Interval: 100 steps
        </Typography>
        <Typography variant="caption" display="block">
          Prioritized Replay: Optional
        </Typography>
      </Paper>
    </Box>
  );
}
