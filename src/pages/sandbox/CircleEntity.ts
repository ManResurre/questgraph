// src/pages/sandbox/CircleEntity.ts
import { Sprite, Texture } from "pixi.js";

export class CircleEntity extends Sprite {
  hp = 1;
  canShoot = false;
  vx = 0;
  vy = 0;
  shoot?: () => void;
  baseColor: number;

  constructor(texture: Texture, color: number) {
    super(texture);
    this.baseColor = color;
    this.anchor.set(0.5);
  }

  setTint(c: number) {
    this.tint = c;
  }

  resetTint() {
    this.tint = this.baseColor;
  }
}
