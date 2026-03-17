import { Bot } from "./Bot";
import { Entity } from "./Entity";
import { circleCollision } from "./utils";
import {
  ARENA_WIDTH,
  ARENA_HEIGHT,
  BULLET_MAX_SPEED,
  BULLET_DAMAGE,
} from "./config";

export class Bullet extends Entity {
  vx = 0;
  vy = 0;

  ax = 0;
  ay = 0;

  maxSpeed = BULLET_MAX_SPEED;

  owner: Bot | null = null;

  addOwner(owner: Bot) {
    this.owner = owner;
    return this;
  }

  addVelocity(vx: number, vy: number) {
    this.vx = vx;
    this.vy = vy;
    return this;
  }

  update(delta: number): void {
    if (!this.owner || !this.owner.enemy) {
      this.destroy();
      return;
    }

    const enemy = this.owner.enemy;

    this.vx += this.ax * delta;
    this.vy += this.ay * delta;

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > this.maxSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed;
      this.vy = (this.vy / speed) * this.maxSpeed;
    }

    this.x += this.vx * delta;
    this.y += this.vy * delta;

    if (circleCollision(this, enemy, 16)) {
      enemy.hp = Math.max(0, enemy.hp - BULLET_DAMAGE);
      if (enemy.hp <= 0 && this.owner) {
        this.owner.kills++;
      }
      this.destroy();
      return;
    }

    if (
      this.x < 0 ||
      this.x > ARENA_WIDTH ||
      this.y < 0 ||
      this.y > ARENA_HEIGHT
    ) {
      this.destroy();
    }
  }
}
