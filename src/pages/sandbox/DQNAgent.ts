import * as tf from "@tensorflow/tfjs";
import {
  RL_GAMMA,
  RL_EPSILON_START,
  RL_EPSILON_MIN,
  RL_EPSILON_DECAY,
  RL_LEARNING_RATE,
  RL_MEMORY_SIZE,
  RL_REPLAY_BATCH_SIZE,
  RL_TARGET_UPDATE_INTERVAL,
} from "./config";
import type { RLExperience } from "./types";

/**
 * Приоритетный опыт для Prioritized Experience Replay
 */
export interface PrioritizedExperience extends RLExperience {
  priority: number;
}

/**
 * Метрики обучения для отслеживания прогресса
 */
export interface TrainingMetrics {
  epsilon: number;
  loss: number;
  averageReward: number;
  totalSteps: number;
  episodes: number;
}

/**
 * Оптимизированный replay buffer с эффективным random sampling
 * Использует циклический буфер и предварительную генерацию индексов
 */
class ReplayBuffer {
  private buffer: RLExperience[] = [];
  private capacity: number;
  private index = 0;
  private size = 0;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  push(experience: RLExperience): void {
    if (this.buffer.length < this.capacity) {
      this.buffer.push(experience);
    } else {
      this.buffer[this.index] = experience;
    }
    this.index = (this.index + 1) % this.capacity;
    this.size = Math.min(this.size + 1, this.capacity);
  }

  get length(): number {
    return this.size;
  }

  /** Получить случайную выборку без повторений */
  sample(batchSize: number): RLExperience[] {
    const result: RLExperience[] = [];
    const len = this.size;

    if (batchSize >= len) {
      return [...this.buffer];
    }

    // Используем Set для избежания повторений
    const usedIndices = new Set<number>();

    while (result.length < batchSize) {
      const idx = Math.floor(Math.random() * len);
      if (!usedIndices.has(idx)) {
        usedIndices.add(idx);
        result.push(this.buffer[idx]);
      }
    }

    return result;
  }

  clear(): void {
    this.buffer = [];
    this.index = 0;
    this.size = 0;
  }

  toArray(): RLExperience[] {
    return [...this.buffer];
  }
}

/**
 * Приоритетный Replay Buffer для Prioritized Experience Replay
 * Использует SumTree для эффективной выборки по приоритетам
 */
class PrioritizedReplayBuffer {
  private capacity: number;
  private tree: number[] = [];
  private buffer: PrioritizedExperience[] = [];
  private index = 0;
  private size = 0;
  private maxPriority = 1.0;
  private minPriority = 1.0;
  private alpha = 0.6; // степень приоритизации
  private beta = 0.4; // важность выборки
  private betaIncrement = 0.001;

  constructor(capacity: number) {
    this.capacity = capacity;
    // Инициализация SumTree (размер = 2 * capacity - 1)
    const treeSize = 2 * capacity - 1;
    for (let i = 0; i < treeSize; i++) {
      this.tree.push(0);
    }
  }

  private updateTree(idx: number, priority: number): void {
    const treeIdx = idx + this.capacity - 1;
    this.tree[treeIdx] = priority;

    let i = treeIdx;
    while (i > 0) {
      i = Math.floor((i - 1) / 2);
      this.tree[i] = this.tree[2 * i + 1] + this.tree[2 * i + 2];
    }
  }

  push(experience: PrioritizedExperience): void {
    const priority = experience.priority || this.maxPriority;

    if (this.buffer.length < this.capacity) {
      this.buffer.push(experience);
      this.updateTree(this.size, priority);
      this.size++;
    } else {
      this.buffer[this.index] = experience;
      this.updateTree(this.index, priority);
    }

    this.index = (this.index + 1) % this.capacity;
    this.maxPriority = Math.max(this.maxPriority, priority);
    this.minPriority = Math.min(this.minPriority, priority);
  }

  get length(): number {
    return this.size;
  }

  /** Получить выборку на основе приоритетов */
  sample(batchSize: number): {
    experiences: PrioritizedExperience[];
    weights: number[];
    indices: number[];
  } {
    const result: PrioritizedExperience[] = [];
    const indices: number[] = [];
    const priorities: number[] = [];

    const segment = this.totalPriority / batchSize;
    this.beta = Math.min(1.0, this.beta + this.betaIncrement);

    for (let i = 0; i < batchSize; i++) {
      const a = segment * i;
      const b = segment * (i + 1);
      const value = Math.random() * (b - a) + a;

      const idx = this.findByValue(value);
      if (idx !== -1 && idx < this.size) {
        result.push(this.buffer[idx]);
        indices.push(idx);
        priorities.push(this.tree[idx + this.capacity - 1]);
      }
    }

    // Вычисление весов важности
    const weights = priorities.map((p) => {
      const prob = p / this.totalPriority;
      return Math.pow(prob * this.size, -this.beta);
    });

    // Нормализация весов
    const maxWeight = Math.max(...weights);
    const normalizedWeights = weights.map((w) => w / maxWeight);

    return {
      experiences: result,
      weights: normalizedWeights,
      indices,
    };
  }

  private get totalPriority(): number {
    return this.tree[0];
  }

  private findByValue(value: number): number {
    let idx = 0;
    while (idx < this.capacity - 1) {
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;

      if (left >= this.tree.length) break;

      if (value <= this.tree[left]) {
        idx = left;
      } else {
        value -= this.tree[left];
        idx = right;
      }
    }
    return idx - (this.capacity - 1);
  }

  /** Обновить приоритет опыта */
  updatePriority(idx: number, priority: number): void {
    if (idx >= 0 && idx < this.size) {
      this.updateTree(idx, priority);
      this.maxPriority = Math.max(this.maxPriority, priority);
    }
  }

  clear(): void {
    this.buffer = [];
    this.index = 0;
    this.size = 0;
    this.tree.fill(0);
    this.maxPriority = 1.0;
    this.minPriority = 1.0;
  }
}

export class DQNAgent {
  stateSize: number;
  actionSize: number;

  gamma = RL_GAMMA;
  epsilon = RL_EPSILON_START;
  epsilonMin = RL_EPSILON_MIN;
  epsilonDecay = RL_EPSILON_DECAY;
  learningRate = RL_LEARNING_RATE;

  /** Основная модель */
  model: tf.LayersModel;

  /** Target network для стабильности обучения */
  targetModel: tf.LayersModel;

  /** Счётчик шагов для обновления target network */
  private stepCount = 0;

  /** Метрики обучения */
  private metrics: TrainingMetrics = {
    epsilon: RL_EPSILON_START,
    loss: 0,
    averageReward: 0,
    totalSteps: 0,
    episodes: 0,
  };

  /** Скользящее среднее для reward */
  private rewardWindow: number[] = [];
  private rewardWindowSize = 100;

  /** Оптимизированный replay buffer */
  private replayBuffer: ReplayBuffer;

  /** Приоритетный replay buffer (опционально) */
  private prioritizedBuffer: PrioritizedReplayBuffer | null = null;

  /** Использовать приоритетный replay */
  usePrioritizedReplay = false;

  /** Максимальный приоритет для новых опытов */
  private maxPriority = 1.0;

  constructor(
    stateSize: number,
    actionSize: number,
    usePrioritizedReplay = false,
  ) {
    this.stateSize = stateSize;
    this.actionSize = actionSize;
    this.usePrioritizedReplay = usePrioritizedReplay;
    this.replayBuffer = new ReplayBuffer(RL_MEMORY_SIZE);
    if (usePrioritizedReplay) {
      this.prioritizedBuffer = new PrioritizedReplayBuffer(RL_MEMORY_SIZE);
    }
    this.model = this.buildModel();
    this.targetModel = this.buildModel();
    this.copyWeights();
  }

  private buildModel(): tf.LayersModel {
    const model = tf.sequential();

    model.add(
      tf.layers.dense({
        units: 64,
        activation: "relu",
        inputShape: [this.stateSize],
      }),
    );

    model.add(
      tf.layers.dense({
        units: 64,
        activation: "relu",
      }),
    );

    model.add(
      tf.layers.dense({
        units: this.actionSize,
        activation: "linear",
      }),
    );

    model.compile({
      optimizer: tf.train.adam(this.learningRate),
      loss: "meanSquaredError",
    });

    return model;
  }

  /** Скопировать веса из основной модели в target */
  copyWeights(): void {
    const weights = this.model.getWeights();
    this.targetModel.setWeights(weights);
  }

  act(state: number[]): number {
    // epsilon-greedy
    if (Math.random() < this.epsilon) {
      return Math.floor(Math.random() * this.actionSize);
    }

    return tf.tidy(() => {
      const input = tf.tensor([state]);
      const q = this.model.predict(input) as tf.Tensor;
      const arr = q.dataSync();
      return arr.indexOf(Math.max(...arr));
    });
  }

  /**
   * Act с использованием target network для стабильности
   */
  actWithTarget(state: number[]): number {
    if (Math.random() < this.epsilon) {
      return Math.floor(Math.random() * this.actionSize);
    }

    return tf.tidy(() => {
      const input = tf.tensor([state]);
      const q = this.targetModel.predict(input) as tf.Tensor;
      const arr = q.dataSync();
      return arr.indexOf(Math.max(...arr));
    });
  }

  remember(
    state: number[],
    action: number,
    reward: number,
    nextState: number[],
    done: boolean,
  ) {
    this.replayBuffer.push({ state, action, reward, nextState, done });

    if (this.prioritizedBuffer) {
      this.prioritizedBuffer.push({
        state,
        action,
        reward,
        nextState,
        done,
        priority: this.maxPriority,
      });
    }

    // Обновление метрик
    this.rewardWindow.push(reward);
    if (this.rewardWindow.length > this.rewardWindowSize) {
      this.rewardWindow.shift();
    }
    this.metrics.averageReward =
      this.rewardWindow.reduce((a, b) => a + b, 0) / this.rewardWindow.length;
    this.metrics.totalSteps++;
  }

  async replay(batchSize = RL_REPLAY_BATCH_SIZE): Promise<number> {
    const buffer =
      this.usePrioritizedReplay && this.prioritizedBuffer
        ? this.prioritizedBuffer
        : this.replayBuffer;

    if (buffer.length < batchSize) return 0;

    let loss = 0;

    if (this.usePrioritizedReplay && this.prioritizedBuffer) {
      // Prioritized Experience Replay
      const { experiences, weights, indices } =
        this.prioritizedBuffer.sample(batchSize);

      const states: number[][] = [];
      const targets: number[][] = [];

      for (let i = 0; i < experiences.length; i++) {
        const sample = experiences[i];
        const weight = weights[i];
        const { state, action, reward, nextState, done } = sample;

        const q = (
          this.model.predict(tf.tensor([state])) as tf.Tensor
        ).dataSync();
        const target = [...q];

        if (done) {
          target[action] = reward;
        } else {
          // Используем target network для стабильности
          const nextQ = (
            this.targetModel.predict(tf.tensor([nextState])) as tf.Tensor
          ).dataSync();
          target[action] = reward + this.gamma * Math.max(...nextQ);
        }

        states.push(state);
        targets.push(target);

        // Обновление приоритета
        const tdError = Math.abs(target[action] - q[action]);
        this.prioritizedBuffer.updatePriority(indices[i], tdError + 0.01);
      }

      const history = await this.model.fit(
        tf.tensor(states),
        tf.tensor(targets),
        {
          epochs: 1,
          batchSize,
          verbose: 0,
          sampleWeight: tf.tensor(weights),
        },
      );

      loss = history.history.loss[0] as number;
    } else {
      // Стандартный Experience Replay
      const batch = this.replayBuffer.sample(batchSize);

      const states: number[][] = [];
      const targets: number[][] = [];

      for (const sample of batch) {
        const { state, action, reward, nextState, done } = sample;

        const q = (
          this.model.predict(tf.tensor([state])) as tf.Tensor
        ).dataSync();
        const target = [...q];

        if (done) {
          target[action] = reward;
        } else {
          // Используем target network для стабильности
          const nextQ = (
            this.targetModel.predict(tf.tensor([nextState])) as tf.Tensor
          ).dataSync();
          target[action] = reward + this.gamma * Math.max(...nextQ);
        }

        states.push(state);
        targets.push(target);
      }

      const history = await this.model.fit(
        tf.tensor(states),
        tf.tensor(targets),
        {
          epochs: 1,
          batchSize,
          verbose: 0,
        },
      );

      loss = history.history.loss[0] as number;
    }

    // Обновление epsilon
    if (this.epsilon > this.epsilonMin) {
      this.epsilon *= this.epsilonDecay;
    }

    // Обновление target network
    this.stepCount++;
    if (this.stepCount % RL_TARGET_UPDATE_INTERVAL === 0) {
      this.copyWeights();
    }

    // Обновление метрик
    this.metrics.epsilon = this.epsilon;
    this.metrics.loss = loss;

    return loss;
  }

  /** Получить размер памяти */
  getMemorySize(): number {
    return this.usePrioritizedReplay && this.prioritizedBuffer
      ? this.prioritizedBuffer.length
      : this.replayBuffer.length;
  }

  /** Очистить память */
  clearMemory(): void {
    this.replayBuffer.clear();
    if (this.prioritizedBuffer) {
      this.prioritizedBuffer.clear();
    }
    this.rewardWindow = [];
    this.metrics.averageReward = 0;
  }

  /** Получить текущие метрики */
  getMetrics(): TrainingMetrics {
    return { ...this.metrics };
  }

  /** Сбросить метрики */
  resetMetrics(): void {
    this.metrics = {
      epsilon: this.epsilon,
      loss: 0,
      averageReward: 0,
      totalSteps: 0,
      episodes: 0,
    };
    this.rewardWindow = [];
  }

  /** Увеличить счётчик эпизодов */
  incrementEpisode(): void {
    this.metrics.episodes++;
  }

  /**
   * Сохранить модель в IndexedDB
   */
  async saveModel(modelName: string): Promise<void> {
    await this.model.save(`indexeddb://${modelName}_main`);
    await this.targetModel.save(`indexeddb://${modelName}_target`);
  }

  /**
   * Загрузить модель из IndexedDB
   */
  async loadModel(modelName: string): Promise<void> {
    try {
      const mainModel = await tf.loadLayersModel(
        `indexeddb://${modelName}_main`,
      );
      const targetModel = await tf.loadLayersModel(
        `indexeddb://${modelName}_target`,
      );

      this.model.dispose();
      this.targetModel.dispose();

      this.model = mainModel;
      this.targetModel = targetModel;
    } catch (error) {
      console.error("Ошибка загрузки модели:", error);
      throw error;
    }
  }

  /**
   * Экспорт весов модели в JSON
   */
  exportWeights(): string {
    const weights = this.model.getWeights().map((w, i) => ({
      index: i,
      shape: w.shape,
      data: Array.from(w.dataSync()),
    }));
    return JSON.stringify({
      stateSize: this.stateSize,
      actionSize: this.actionSize,
      epsilon: this.epsilon,
      weights,
    });
  }

  /**
   * Импорт весов модели из JSON
   */
  importWeights(json: string): void {
    try {
      const data = JSON.parse(json);

      if (
        data.stateSize !== this.stateSize ||
        data.actionSize !== this.actionSize
      ) {
        throw new Error("Несовместимая структура модели");
      }

      const weights = data.weights.map(
        (w: { name: string; shape: number[]; data: number[] }) =>
          tf.tensor(w.data, w.shape),
      );

      this.model.setWeights(weights);
      this.copyWeights();

      if (data.epsilon !== undefined) {
        this.epsilon = data.epsilon;
      }
    } catch (error) {
      console.error("Ошибка импорта весов:", error);
      throw error;
    }
  }

  /**
   * Очистка ресурсов
   */
  dispose(): void {
    this.model.dispose();
    this.targetModel.dispose();
  }
}
