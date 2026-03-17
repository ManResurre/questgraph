import { Graphics } from "pixi.js";

export class Cover extends Graphics {
  setPosition(x: number, y: number) {
    this.position.set(x, y);
    return this;
  }
}
