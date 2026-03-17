import * as tf from "@tensorflow/tfjs";
import {
  RL_GAMMA,
  RL_EPSILON_START,
  RL_EPSILON_MIN,
  RL_EPSILON_DECAY,
  RL_LEARNING_RATE,
  RL_MEMORY_SIZE,
  RL_REPLAY_BATCH_SIZE,
} from "./config";
import type { RLExperience } from "./types";

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

export class DQNAgent {
  stateSize: number;
  actionSize: number;

  gamma = RL_GAMMA;
  epsilon = RL_EPSILON_START;
  epsilonMin = RL_EPSILON_MIN;
  epsilonDecay = RL_EPSILON_DECAY;
  learningRate = RL_LEARNING_RATE;

  /** Оптимизированный replay buffer */
  private replayBuffer: ReplayBuffer;

  model: tf.LayersModel;

  constructor(stateSize: number, actionSize: number) {
    this.stateSize = stateSize;
    this.actionSize = actionSize;
    this.replayBuffer = new ReplayBuffer(RL_MEMORY_SIZE);
    this.model = this.buildModel();
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

  remember(
    state: number[],
    action: number,
    reward: number,
    nextState: number[],
    done: boolean,
  ) {
    this.replayBuffer.push({ state, action, reward, nextState, done });
  }

  async replay(batchSize = RL_REPLAY_BATCH_SIZE) {
    if (this.replayBuffer.length < batchSize) return;

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
        const nextQ = (
          this.model.predict(tf.tensor([nextState])) as tf.Tensor
        ).dataSync();
        target[action] = reward + this.gamma * Math.max(...nextQ);
      }

      states.push(state);
      targets.push(target);
    }

    await this.model.fit(tf.tensor(states), tf.tensor(targets), {
      epochs: 1,
      batchSize,
      verbose: 0,
    });

    if (this.epsilon > this.epsilonMin) {
      this.epsilon *= this.epsilonDecay;
    }
  }

  /** Получить размер памяти */
  getMemorySize(): number {
    return this.replayBuffer.length;
  }

  /** Очистить память */
  clearMemory(): void {
    this.replayBuffer.clear();
  }
}
