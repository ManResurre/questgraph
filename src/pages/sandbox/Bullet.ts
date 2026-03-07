// src/pages/sandbox/Bullet.ts
import { Sprite, Texture } from "pixi.js";

export class Bullet extends Sprite {
  vx: number;
  vy: number;

  constructor(texture: Texture, x: number, y: number, tx: number, ty: number, speed = 6) {
    super(texture);

    this.x = x;
    this.y = y;
    this.anchor.set(0.5);

    const angle = Math.atan2(ty - y, tx - x);
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
  }
}
