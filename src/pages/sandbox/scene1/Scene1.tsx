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
import { encode } from "@toon-format/toon";
import { Application, HTMLText } from "pixi.js";
import { useEffect, useRef, useState, useCallback } from "react";
import { BotLogEntry } from "../Bot";
import { ARENA_WIDTH, ARENA_HEIGHT } from "../config";
import { DQNAgent } from "../DQNAgent";
import { EntityManager } from "../EntityManager";
import { Health } from "../Health";
import { RectCover } from "../RectCover";

interface Stats {
  fps: number;
  epsilon: number;
  loss: number;
  averageReward: number;
  memorySize: number;
  totalSteps: number;
  episodes: number;
}

interface BotLogsSummary {
  totalActions: number;
  avgReward: number;
  pickupCount: number;
  outOfBoundsCount: number;
  shootThroughWallCount: number;
  deathCount: number;
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

  const [botCount, setBotCount] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [timeScale, setTimeScale] = useState(1);
  const [isStarted, setIsStarted] = useState(false);
  const [logsSummary, setLogsSummary] = useState<BotLogsSummary | null>(null);

  // Обновление статистики
  const updateStats = useCallback(() => {
    if (!managerRef.current) return;

    const bots = managerRef.current.bots;
    if (bots.length > 0) {
      const agent = bots[0].agent;
      const metrics = agent.getMetrics();

      setStats((prev) => ({
        fps: prev.fps, // Сохраняем FPS из предыдущего состояния
        epsilon: metrics.epsilon,
        loss: metrics.loss,
        averageReward: metrics.averageReward,
        memorySize: agent.getMemorySize(),
        totalSteps: metrics.totalSteps,
        episodes: metrics.episodes, // Episodes из метрик агента
      }));

      // Обновляем сводку логов
      const logs = bots[0].getLogs();
      if (logs.length > 0) {
        const pickupCount = logs.filter(
          (l: BotLogEntry) => l.reward >= 10, // RL_REWARD_PICKUP_ITEM = 10
        ).length;
        const outOfBoundsCount = logs.filter(
          (l: BotLogEntry) => l.isOutOfBounds,
        ).length;
        const shootThroughWallCount = logs.filter(
          (l: BotLogEntry) => l.shotThroughWall,
        ).length;
        const deathCount = logs.filter((l: BotLogEntry) => l.hp <= 0).length;
        const avgReward =
          logs.reduce((sum: number, l: BotLogEntry) => sum + l.reward, 0) /
          logs.length;

        setLogsSummary({
          totalActions: logs.length,
          avgReward,
          pickupCount,
          outOfBoundsCount,
          shootThroughWallCount,
          deathCount,
        });
      }
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
      initializedRef.current = true;

      app = new Application();
      appRef.current = app;

      await app.init({
        canvas: canvasRef.current,
        background: "#222",
        antialias: true,
        width: ARENA_WIDTH,
        height: ARENA_HEIGHT,
      });

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
      if (!canvasRef.current || !appRef.current) return;
      appRef.current.destroy(true);
      appRef.current = null;
    };
  }, []);

  // Старт симуляции
  const handleStart = useCallback(() => {
    if (!managerRef.current || !appRef.current || isStarted) return;

    const manager = managerRef.current;
    const app = appRef.current;

    // Всегда используем режим исследования
    // Если 1 бот — просто бегает и собирает аптечки
    // Если > 1 бота — боты сражаются друг с другом
    manager.setBotCount(botCount);

    // Очищаем старые укрытия перед добавлением новых
    while (manager.covers.length > 0) {
      manager.removeCover(manager.covers[0]);
    }

    // === РЕЖИМ ИССЛЕДОВАНИЯ: Коридоры ===
    {
      // Горизонтальные стены — верхний ряд
      const topCorridors = [
        { x: 150, y: 80, w: 120, h: 25 },
        { x: 400, y: 80, w: 120, h: 25 },
        { x: 650, y: 80, w: 120, h: 25 },
      ];
      for (const c of topCorridors) {
        const cover = new RectCover()
          .setPosition(c.x, c.y)
          .setSize(c.w, c.h)
          .setType("indestructible")
          .draw();
        app.stage.addChild(cover);
        manager.addCover(cover);
      }

      // Горизонтальные стены — средний ряд
      const midCorridors = [
        { x: 100, y: 280, w: 100, h: 25 },
        { x: 350, y: 280, w: 100, h: 25 },
        { x: 600, y: 280, w: 100, h: 25 },
      ];
      for (const c of midCorridors) {
        const cover = new RectCover()
          .setPosition(c.x, c.y)
          .setSize(c.w, c.h)
          .setType("indestructible")
          .draw();
        app.stage.addChild(cover);
        manager.addCover(cover);
      }

      // Горизонтальные стены — нижний ряд
      const bottomCorridors = [
        { x: 150, y: 480, w: 120, h: 25 },
        { x: 400, y: 480, w: 120, h: 25 },
        { x: 650, y: 480, w: 120, h: 25 },
      ];
      for (const c of bottomCorridors) {
        const cover = new RectCover()
          .setPosition(c.x, c.y)
          .setSize(c.w, c.h)
          .setType("indestructible")
          .draw();
        app.stage.addChild(cover);
        manager.addCover(cover);
      }

      // Вертикальные соединители
      const verticalConnectors = [
        { x: 100, y: 180, w: 25, h: 80 },
        { x: 600, y: 180, w: 25, h: 80 },
        { x: 100, y: 380, w: 25, h: 80 },
        { x: 600, y: 380, w: 25, h: 80 },
        { x: 350, y: 180, w: 25, h: 80 },
        { x: 350, y: 380, w: 25, h: 80 },
      ];
      for (const c of verticalConnectors) {
        const cover = new RectCover()
          .setPosition(c.x, c.y)
          .setSize(c.w, c.h)
          .setType("indestructible")
          .draw();
        app.stage.addChild(cover);
        manager.addCover(cover);
      }

      // Добавляем 10 аптечек для сбора
      const itemPositions = [
        { x: 200, y: 180 },
        { x: 450, y: 180 },
        { x: 200, y: 380 },
        { x: 450, y: 380 },
        { x: 200, y: 550 },
        { x: 450, y: 550 },
        { x: 50, y: 280 },
        { x: 500, y: 280 },
        { x: 700, y: 180 },
        { x: 700, y: 480 },
      ];
      for (const pos of itemPositions) {
        const item = new Health().setPosition(pos.x, pos.y).draw();
        manager.addItem(item);
        app.stage.addChild(item);
      }
    }

    setIsStarted(true);
  }, [botCount, isStarted]);

  // Синхронизация paused
  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  // Синхронизация botCount во время работы
  useEffect(() => {
    if (managerRef.current && isStarted) {
      managerRef.current.setBotCount(botCount);
    }
  }, [botCount, isStarted]);

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
    DQNAgent.globalSteps = 0;

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

  const handleExportLogs = () => {
    if (!managerRef.current || managerRef.current.bots.length === 0) return;

    const bot = managerRef.current.bots[0];
    const logs = bot.getLogs();

    // Используем библиотеку @toon-format/toon для кодирования
    const toon = encode({ logs }, { indent: 0 });

    const blob = new Blob([toon], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bot-logs-${Date.now()}.toon`;
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

        {/* Панель логов поведения бота */}
        {logsSummary && (
          <>
            <Typography variant="subtitle2" fontWeight="bold" mt={2} mb={1}>
              Bot Behavior Logs (last 1000 actions)
            </Typography>
            <Grid container spacing={1}>
              <Grid size={12}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Total Actions
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {logsSummary.totalActions}
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
                    color={logsSummary.avgReward >= 0 ? "success" : "error"}
                  >
                    {logsSummary.avgReward.toFixed(4)}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={12}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Pickups (+10)
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="success">
                    {logsSummary.pickupCount}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={12}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Out of Bounds (-5)
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="error">
                    {logsSummary.outOfBoundsCount}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={12}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Shoot thru Wall (-2)
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="warning">
                    {logsSummary.shootThroughWallCount}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={12}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Deaths (-10)
                  </Typography>
                  <Typography variant="body2" fontWeight="bold" color="error">
                    {logsSummary.deathCount}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Button
              variant="outlined"
              size="small"
              onClick={handleExportLogs}
              fullWidth
              sx={{ mt: 2 }}
            >
              Export Logs (TOON)
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}
