import { Entity } from "./Entity";
import { circleCollision } from "./utils";
import {
  ARENA_MIN_X,
  ARENA_MAX_X,
  ARENA_MIN_Y,
  ARENA_MAX_Y,
  SPAWN_MIN_DIST_FROM_COVER,
  SPAWN_MIN_DIST_FROM_BOT,
  HEALTH_RADIUS,
} from "./config";

/** Цвет аптечки */
const HEALTH_COLOR = 0x44ff44;

export class Health extends Entity {
  /** Радиус аптечки */
  radius: number = HEALTH_RADIUS;

  /**
   * Нарисовать аптечку (зелёный круг)
   */
  draw(): this {
    this.clear();
    this.circle(0, 0, this.radius);
    this.fill(HEALTH_COLOR);
    this.restore();
    return this;
  }

  respawn() {
    if (!this.manager) return;

    let x: number;
    let y: number;

    for (;;) {
      x = Math.random() * (ARENA_MAX_X - ARENA_MIN_X) + ARENA_MIN_X;
      y = Math.random() * (ARENA_MAX_Y - ARENA_MIN_Y) + ARENA_MIN_Y;

      let bad = false;

      for (const cover of this.manager.covers) {
        if (circleCollision({ x, y }, cover, SPAWN_MIN_DIST_FROM_COVER)) {
          bad = true;
          break;
        }
      }

      if (bad) continue;

      for (const bot of this.manager.bots) {
        if (circleCollision({ x, y }, bot, SPAWN_MIN_DIST_FROM_BOT)) {
          bad = true;
          break;
        }
      }

      if (!bad) break;
    }

    this.setPosition(x, y);
  }
}
