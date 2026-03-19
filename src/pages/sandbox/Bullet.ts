import { Bot } from "./Bot";
import {
  ARENA_WIDTH,
  ARENA_HEIGHT,
  BULLET_MAX_SPEED,
  BULLET_DAMAGE,
  BULLET_RADIUS,
  COLLISION_BOT_RADIUS,
  BULLET_POOL_SIZE,
  COVER_BULLET_DAMAGE,
  COLLISION_COVER_RADIUS,
} from "./config";
import { Cover } from "./Cover";
import { Entity } from "./Entity";
import { RectCover } from "./RectCover";
import { circleCollision, circleRectCollision } from "./utils";

/** Object pool для пуль */
export class BulletPool {
  private pool: Bullet[] = [];
  private active: Bullet[] = [];

  constructor(size: number = BULLET_POOL_SIZE) {
    for (let i = 0; i < size; i++) {
      const bullet = new Bullet().circle(0, 0, 5).fill(0xffffff).restore();
      bullet.visible = false;
      this.pool.push(bullet);
    }
  }

  acquire(
    owner: Bot,
    x: number,
    y: number,
    vx: number,
    vy: number,
  ): Bullet | null {
    const bullet = this.pool.pop();
    if (!bullet) return null;

    bullet.reset(x, y, vx, vy, owner);
    bullet.visible = true;
    this.active.push(bullet);
    return bullet;
  }

  release(bullet: Bullet): void {
    const idx = this.active.indexOf(bullet);
    if (idx !== -1) {
      this.active.splice(idx, 1);
    }
    bullet.visible = false;
    bullet.destroyed = false;
    this.pool.push(bullet);
  }

  getActive(): Bullet[] {
    return this.active;
  }

  update(delta: number): void {
    for (let i = this.active.length - 1; i >= 0; i--) {
      const bullet = this.active[i];
      bullet.update(delta);
      if (bullet.destroyed) {
        this.release(bullet);
      }
    }
  }

  clear(): void {
    while (this.active.length > 0) {
      const bullet = this.active.pop();
      if (bullet) {
        bullet.visible = false;
        this.pool.push(bullet);
      }
    }
  }
}

export class Bullet extends Entity {
  vx = 0;
  vy = 0;

  ax = 0;
  ay = 0;

  maxSpeed = BULLET_MAX_SPEED;

  owner: Bot | null = null;

  /** Сбросить и инициализировать пулю */
  reset(x: number, y: number, vx: number, vy: number, owner: Bot): this {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.owner = owner;
    this.destroyed = false;
    return this;
  }

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
    if (!this.owner || !this.owner.manager) {
      this.destroy();
      return;
    }

    const enemy = this.owner.enemy;
    const manager = this.owner.manager;

    this.vx += this.ax * delta;
    this.vy += this.ay * delta;

    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > this.maxSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed;
      this.vy = (this.vy / speed) * this.maxSpeed;
    }

    this.x += this.vx * delta;
    this.y += this.vy * delta;

    // Проверка коллизии с укрытиями (круглыми и прямоугольными)
    const nearby = manager.getNearbyObjects(
      this.x,
      this.y,
      COLLISION_COVER_RADIUS + BULLET_RADIUS + 50, // +50 для прямоугольных
    );
    for (const obj of nearby) {
      // Круглые укрытия
      if (obj instanceof Cover) {
        if (
          circleCollision(this, obj, COLLISION_COVER_RADIUS + BULLET_RADIUS)
        ) {
          // Проверяем тип укрытия
          if (obj.type === "destructible") {
            // Наносим урон разрушимому укрытию
            const destroyed = obj.takeDamage(COVER_BULLET_DAMAGE);
            if (destroyed) {
              // Укрытие уничтожено — удаляем его
              manager.removeCover(obj);
            }
          }
          // Пуля уничтожается при попадании в любое укрытие
          this.destroy();
          return;
        }
      }
      // Прямоугольные укрытия
      else if (obj instanceof RectCover) {
        if (
          circleRectCollision(
            this.x,
            this.y,
            BULLET_RADIUS,
            obj.x,
            obj.y,
            obj.coverWidth,
            obj.coverHeight,
          )
        ) {
          // Проверяем тип укрытия
          if (obj.type === "destructible") {
            // Наносим урон разрушимому укрытию
            const destroyed = obj.takeDamage(COVER_BULLET_DAMAGE);
            if (destroyed) {
              // Укрытие уничтожено — удаляем его
              manager.removeCover(obj);
            }
          }
          // Пуля уничтожается при попадании в любое укрытие
          this.destroy();
          return;
        }
      }
    }

    // Проверка коллизии с врагом
    if (enemy && circleCollision(this, enemy, COLLISION_BOT_RADIUS)) {
      enemy.hp = Math.max(0, enemy.hp - BULLET_DAMAGE);
      if (enemy.hp <= 0 && this.owner) {
        this.owner.kills++;
      }
      this.destroy();
      return;
    }

    // Выход за границы арены
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
