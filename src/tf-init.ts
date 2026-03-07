import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-cpu";
import "@tensorflow/tfjs-layers";

export async function initTF() {
    await tf.setBackend("cpu");
    await tf.ready();
}
