import { HTMLText } from "pixi.js";
import { DQNAgent } from "./DQNAgent";
import { getRays } from "./raycast";
import { Health } from "./Health";
import { EntityManager } from "./EntityManager";
import { Entity } from "./Entity";
import {
  ARENA_WIDTH,
  ARENA_HEIGHT,
  ARENA_MIN_X,
  ARENA_MAX_X,
  ARENA_MIN_Y,
  ARENA_MAX_Y,
  BOT_ACCEL,
  BOT_FRICTION,
  BOT_MAX_SPEED,
  BOT_START_HP,
  BOT_MAX_HP,
  HEALTH_PICKUP_RADIUS,
  HEALTH_PICKUP_HEAL,
  MAX_BULLETS_PER_BOT,
  BULLET_SPAWN_DIST,
  BULLET_DAMAGE,
  RL_REWARD_STEP,
  RL_REWARD_OUT_OF_BOUNDS,
  RL_REWARD_DAMAGE,
  RL_REWARD_DEATH,
  RL_REWARD_AVOID_BULLET,
  RL_REWARD_APPROACH_ITEM,
  RL_REWARD_PICKUP_ITEM,
  RL_REPLAY_INTERVAL,
} from "./config";

/** Пул массивов для getState (избегаем аллокаций в игровом цикле) */
const STATE_ARRAY_POOL: number[][] = [];
const STATE_POOL_SIZE = 20;
let statePoolIndex = 0;

for (let i = 0; i < STATE_POOL_SIZE; i++) {
  STATE_ARRAY_POOL.push(new Array(44)); // 8 базовых + 36 raycast (12 * 3)
}

/** Получить массив из пула */
function acquireStateArray(): number[] {
  const arr = STATE_ARRAY_POOL[statePoolIndex];
  statePoolIndex = (statePoolIndex + 1) % STATE_POOL_SIZE;
  return arr;
}

export class Bot extends Entity {
  id = 0;
  hp = BOT_START_HP;
  canShoot = false;

  agent: DQNAgent;

  enemy: Bot | null = null;
  item: Health | null = null;

  hpText: HTMLText | null = null;

  vx = 0;
  vy = 0;
  accel = BOT_ACCEL;
  friction = BOT_FRICTION;
  maxSpeed = BOT_MAX_SPEED;

  kills = 0;

  // глобальный счётчик шагов для обучения
  static globalStep = 0;

  constructor() {
    super();
    this.id = Math.floor(Math.random() * 10000);
    this.agent = new DQNAgent(44, 8);
  }

  addBrain() {
    return this;
  }

  bot(hp: number, canShoot: boolean) {
    this.hp = hp;
    this.canShoot = canShoot;

    if (!this.hpText) {
      this.hpText = new HTMLText({
        text: String(this.hp),
        style: {
          fontSize: 14,
          fill: "#ffffff",
          fontWeight: "bold",
          align: "center",
        },
      });

      this.hpText.anchor.set(0.5);
      this.hpText.position.set(0, 0);

      this.addChild(this.hpText);
    }

    this.hpText.text = String(this.hp);

    return this;
  }

  getState() {
    const enemy = this.enemy;
    const item = this.item;
    const manager = this.manager;
    if (!manager) {
      return new Array(44).fill(0);
    }

    const state = acquireStateArray();
    let idx = 0;

    // Нормализованная позиция
    state[idx++] = this.x / ARENA_WIDTH;
    state[idx++] = this.y / ARENA_HEIGHT;

    // Нормализованная позиция врага
    state[idx++] = enemy ? enemy.x / ARENA_WIDTH : 0;
    state[idx++] = enemy ? enemy.y / ARENA_HEIGHT : 0;

    // Нормализованная позиция аптечки
    state[idx++] = item ? item.x / ARENA_WIDTH : 0;
    state[idx++] = item ? item.y / ARENA_HEIGHT : 0;

    // Здоровье и возможность стрельбы
    state[idx++] = this.hp / BOT_MAX_HP;
    state[idx++] = this.canShoot ? 1 : 0;

    // Raycasts (12 лучей * 3 значения = 36)
    const rays = getRays(this, manager, enemy, item);
    for (let i = 0; i < rays.length; i++) {
      state[idx++] = rays[i];
    }

    return state;
  }

  applyAction(action: number) {
    switch (action) {
      case 0:
        this.vx -= this.accel;
        break;
      case 1:
        this.vx += this.accel;
        break;
      case 2:
        this.vy -= this.accel;
        break;
      case 3:
        this.vy += this.accel;
        break;
      case 4:
        this.tryShoot();
        break;
      case 5:
        break;
      case 6:
        if (this.item) this.moveToward(this.item);
        break;
      case 7:
        if (this.enemy) this.moveAway(this.enemy);
        break;
    }
  }

  moveToward(target: Health | Bot) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    this.vx += (dx / len) * this.accel;
    this.vy += (dy / len) * this.accel;
  }

  moveAway(target: Bot) {
    const dx = this.x - target.x;
    const dy = this.y - target.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    this.vx += (dx / len) * this.accel;
    this.vy += (dy / len) * this.accel;
  }

  tryShoot() {
    if (!this.canShoot || !this.enemy) return;
    if (!this.manager) return;

    const pool = this.manager.getBulletPool();
    const activeBullets = pool.getActive();
    if (
      activeBullets.filter((b) => b.owner === this).length >=
      MAX_BULLETS_PER_BOT
    ) {
      return;
    }

    const dx = this.enemy.x - this.x;
    const dy = this.enemy.y - this.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    const speed = 6;
    const vx = (dx / len) * speed;
    const vy = (dy / len) * speed;

    const spawnX = this.x + (dx / len) * BULLET_SPAWN_DIST;
    const spawnY = this.y + (dy / len) * BULLET_SPAWN_DIST;

    const bullet = pool.acquire(this, spawnX, spawnY, vx, vy);
    if (bullet) {
      this.parent?.addChild(bullet);
    }
  }

  getClosestEnemyBulletDistance() {
    if (!this.enemy || !this.manager) return 999;

    let minDist = 999;
    const bullets = this.manager.getBullets();

    for (const b of bullets) {
      if (b.owner === this.enemy) {
        const dx = b.x - this.x;
        const dy = b.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) minDist = dist;
      }
    }

    return minDist;
  }

  getItemDistance() {
    if (!this.item) return 999;
    const dx = this.x - this.item.x;
    const dy = this.y - this.item.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  checkItemPickup() {
    if (!this.item) return false;
    const dx = this.x - this.item.x;
    const dy = this.y - this.item.y;
    return Math.sqrt(dx * dx + dy * dy) < HEALTH_PICKUP_RADIUS;
  }

  isOutOfBounds() {
    return (
      this.x < ARENA_MIN_X ||
      this.x > ARENA_MAX_X ||
      this.y < ARENA_MIN_Y ||
      this.y > ARENA_MAX_Y
    );
  }

  respawn() {
    this.x = Math.random() * (ARENA_MAX_X - ARENA_MIN_X) + ARENA_MIN_X;
    this.y = Math.random() * (ARENA_MAX_Y - ARENA_MIN_Y) + ARENA_MIN_Y;

    this.hp = BOT_START_HP;

    if (this.hpText) {
      this.hpText.text = String(BOT_START_HP);
    }

    this.vx = 0;
    this.vy = 0;
  }

  updatePhysics(delta: number) {
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (speed > this.maxSpeed) {
      this.vx = (this.vx / speed) * this.maxSpeed;
      this.vy = (this.vy / speed) * this.maxSpeed;
    }

    this.x += this.vx * delta;
    this.y += this.vy * delta;

    this.vx *= this.friction;
    this.vy *= this.friction;

    if (this.item && this.checkItemPickup()) {
      this.hp = Math.min(BOT_MAX_HP, this.hp + HEALTH_PICKUP_HEAL);
      this.item.respawn();
      if (this.hpText) this.hpText.text = String(this.hp);
    }

    if (this.x < ARENA_MIN_X) {
      this.x = ARENA_MIN_X;
      this.vx = Math.abs(this.vx) * 0.4;
    }
    if (this.x > ARENA_MAX_X) {
      this.x = ARENA_MAX_X;
      this.vx = -Math.abs(this.vx) * 0.4;
    }
    if (this.y < ARENA_MIN_Y) {
      this.y = ARENA_MIN_Y;
      this.vy = Math.abs(this.vy) * 0.4;
    }
    if (this.y > ARENA_MAX_Y) {
      this.y = ARENA_MAX_Y;
      this.vy = -Math.abs(this.vy) * 0.4;
    }
  }

  // -----------------------------
  // UPDATE RL
  // -----------------------------
  update(delta: number): void {
    if (this.manager) {
      this.enemy = this.manager.getEnemy(this);
      this.item = this.manager.getClosestItem(this);
    }

    const state = this.getState();

    const prevHp = this.hp;
    const closestBulletBefore = this.getClosestEnemyBulletDistance();
    const pickedUpBefore = this.checkItemPickup();
    const prevItemDist = this.getItemDistance();

    // Используем target network для стабильности
    const action = this.agent.actWithTarget(state);
    this.applyAction(action);

    const nextState = this.getState();

    let reward = RL_REWARD_STEP;

    if (this.isOutOfBounds()) reward += RL_REWARD_OUT_OF_BOUNDS;

    if (this.hp <= 0) {
      this.agent.remember(state, action, RL_REWARD_DEATH, nextState, true);
      this.respawn();
      return;
    }

    const closestBulletAfter = this.getClosestEnemyBulletDistance();
    if (closestBulletAfter > closestBulletBefore + 5)
      reward += RL_REWARD_AVOID_BULLET;

    if (this.hp < prevHp) reward += RL_REWARD_DAMAGE;

    const nextItemDist = this.getItemDistance();
    if (nextItemDist < prevItemDist - 2) reward += RL_REWARD_APPROACH_ITEM;

    const pickedUpAfter = this.checkItemPickup();
    if (!pickedUpBefore && pickedUpAfter && this.item) {
      reward += RL_REWARD_PICKUP_ITEM;
      this.hp = Math.min(BOT_MAX_HP, this.hp + HEALTH_PICKUP_HEAL);
      this.item.respawn();
    }

    if (this.hpText) this.hpText.text = String(this.hp);

    this.agent.remember(state, action, reward, nextState, false);

    Bot.globalStep++;
    if (Bot.globalStep % RL_REPLAY_INTERVAL === 0) {
      this.agent.replay(32);
    }
  }
}
