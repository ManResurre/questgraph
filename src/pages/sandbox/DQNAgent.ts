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

export class DQNAgent {
  stateSize: number;
  actionSize: number;

  gamma = RL_GAMMA;
  epsilon = RL_EPSILON_START;
  epsilonMin = RL_EPSILON_MIN;
  epsilonDecay = RL_EPSILON_DECAY;
  learningRate = RL_LEARNING_RATE;

  memory: RLExperience[] = [];

  model: tf.LayersModel;

  constructor(stateSize: number, actionSize: number) {
    this.stateSize = stateSize;
    this.actionSize = actionSize;
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
    this.memory.push({ state, action, reward, nextState, done });
    if (this.memory.length > RL_MEMORY_SIZE) this.memory.shift();
  }

  async replay(batchSize = RL_REPLAY_BATCH_SIZE) {
    if (this.memory.length < batchSize) return;

    const batch = [];
    for (let i = 0; i < batchSize; i++) {
      batch.push(this.memory[Math.floor(Math.random() * this.memory.length)]);
    }

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
}
