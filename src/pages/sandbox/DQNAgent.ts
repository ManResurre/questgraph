import * as tf from "@tensorflow/tfjs-core";
import * as tfl from "@tensorflow/tfjs-layers";

export class DQNAgent {
    stateSize: number;
    actionSize: number;

    gamma = 0.95;
    epsilon = 1.0;
    epsilonMin = 0.05;
    epsilonDecay = 0.995;
    learningRate = 0.001;

    memory: {
        state: number[];
        action: number;
        reward: number;
        nextState: number[];
        done: boolean;
    }[] = [];

    model: tfl.LayersModel;

    constructor(stateSize: number, actionSize: number) {
        this.stateSize = stateSize;
        this.actionSize = actionSize;
        this.model = this.buildModel();
    }

    private buildModel(): tfl.LayersModel {
        const model = tfl.sequential();

        model.add(
            tfl.layers.dense({
                units: 64,
                activation: "relu",
                inputShape: [this.stateSize],
            })
        );

        model.add(
            tfl.layers.dense({
                units: 64,
                activation: "relu",
            })
        );

        model.add(
            tfl.layers.dense({
                units: this.actionSize,
                activation: "linear",
            })
        );

        model.compile({
            optimizer: tf.train.adam(this.learningRate),
            loss: "meanSquaredError",
        });

        return model;
    }

    act(state: number[]): number {
        if (Math.random() < this.epsilon) {
            return Math.floor(Math.random() * this.actionSize);
        }

        const q = this.model.predict(tf.tensor([state])) as tf.Tensor;
        const arr = q.dataSync();
        return arr.indexOf(Math.max(...arr));
    }

    remember(state: number[], action: number, reward: number, nextState: number[], done: boolean) {
        this.memory.push({ state, action, reward, nextState, done });
        if (this.memory.length > 5000) this.memory.shift();
    }

    async replay(batchSize = 32) {
        if (this.memory.length < batchSize) return;

        const batch = [];
        for (let i = 0; i < batchSize; i++) {
            batch.push(this.memory[Math.floor(Math.random() * this.memory.length)]);
        }

        const states: number[][] = [];
        const targets: number[][] = [];

        for (const sample of batch) {
            const { state, action, reward, nextState, done } = sample;

            const q = (this.model.predict(tf.tensor([state])) as tf.Tensor).dataSync();
            const target = [...q];

            if (done) {
                target[action] = reward;
            } else {
                const nextQ = (this.model.predict(tf.tensor([nextState])) as tf.Tensor).dataSync();
                target[action] = reward + this.gamma * Math.max(...nextQ);
            }

            states.push(state);
            targets.push(target);
        }

        await this.model.fit(tf.tensor(states), tf.tensor(targets), {
            epochs: 1,
            batchSize,
        });

        if (this.epsilon > this.epsilonMin) {
            this.epsilon *= this.epsilonDecay;
        }
    }
}
