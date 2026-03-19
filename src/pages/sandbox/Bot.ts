import { HTMLText } from "pixi.js";
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
  RL_REWARD_STEP,
  RL_REWARD_OUT_OF_BOUNDS,
  RL_REWARD_DAMAGE,
  RL_REWARD_DEATH,
  RL_REWARD_AVOID_BULLET,
  RL_REWARD_APPROACH_ITEM,
  RL_REWARD_PICKUP_ITEM,
  RL_REPLAY_INTERVAL,
  COLLISION_BOT_RADIUS,
  COLLISION_COVER_RADIUS,
  RL_REWARD_IDLE,
  RL_REWARD_SHOOT_THROUGH_WALL,
} from "./config";
import { Cover } from "./Cover";
import { DQNAgent } from "./DQNAgent";
import { Entity } from "./Entity";
import { Health } from "./Health";
import { getRays  } from "./raycast";
import { RectCover } from "./RectCover";
import { circleCollision, getCircleRectCollisionResponse } from "./utils";


/** Пул массивов для getState (избегаем аллокаций в игровом цикле) */
const STATE_ARRAY_POOL: number[][] = [];
const STATE_POOL_SIZE = 20;
let statePoolIndex = 0;

for (let i = 0; i < STATE_POOL_SIZE; i++) {
  STATE_ARRAY_POOL.push(new Array(47)); // 11 базовых + 36 raycast (12 * 3)
}

/** Получить массив из пула */
function acquireStateArray(): number[] {
  const arr = STATE_ARRAY_POOL[statePoolIndex];
  statePoolIndex = (statePoolIndex + 1) % STATE_POOL_SIZE;
  return arr;
}

/** Лог поведения бота для анализа */
export interface BotLogEntry {
  step: number;
  action: number;
  reward: number;
  hp: number;
  x: number;
  y: number;
  hasEnemy: boolean;
  hasItem: boolean;
  itemDist: number;
  isOutOfBounds: boolean;
  shotThroughWall: boolean;
  pickedUp: boolean; // Флаг подбора аптечки
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

  // Отслеживание стрельбы для штрафа за стены
  private lastShotStep = -1;
  private shotThroughWall = false;

  // Детекция застревания
  private lastPositions: { x: number; y: number }[] = [];
  private stuckCounter = 0;

  // Логирование поведения
  private logs: BotLogEntry[] = [];

  constructor() {
    super();
    this.id = Math.floor(Math.random() * 10000);
    this.agent = new DQNAgent(47, 8);
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

    // Направление к аптечке (вектор)
    if (item) {
      const dx = item.x - this.x;
      const dy = item.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      state[idx++] = dx / dist; // нормализованный X
      state[idx++] = dy / dist; // нормализованный Y
      state[idx++] = Math.min(dist / 300, 1); // расстояние нормализованное
    } else {
      state[idx++] = 0;
      state[idx++] = 0;
      state[idx++] = 1;
    }

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
        // Если есть враг — убегаем, иначе — идём к аптечке
        if (this.enemy) {
          this.moveAway(this.enemy);
        } else if (this.item) {
          this.moveToward(this.item);
        }
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

    // Проверяем видимость противника через raycast
    const hasLineOfSight = this.checkLineOfSight(this.enemy);

    // Запоминаем факт стрельбы сквозь стену для штрафа в update()
    this.shotThroughWall = !hasLineOfSight;
    this.lastShotStep = DQNAgent.globalSteps;

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

  /**
   * Проверка видимости цели через raycast
   * Возвращает true если между ботом и целью нет препятствий
   */
  private checkLineOfSight(target: Bot): boolean {
    if (!this.manager) return false;

    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    // Нормализованный вектор направления
    const dirX = dx / dist;
    const dirY = dy / dist;

    // Пускаем лучи по направлению к цели с шагом
    const step = 10;
    let currentDist = 0;

    while (currentDist < dist) {
      const x = this.x + dirX * currentDist;
      const y = this.y + dirY * currentDist;

      // Проверяем препятствия в этой точке
      const nearby = this.manager.getNearbyObjects(
        x,
        y,
        COLLISION_COVER_RADIUS,
      );

      for (const obj of nearby) {
        if (obj instanceof Cover || obj instanceof RectCover) {
          // Проверяем коллизию с укрытием
          if (obj instanceof Cover) {
            if (circleCollision({ x, y }, obj, COLLISION_COVER_RADIUS)) {
              return false; // Препятствие найдено
            }
          } else if (obj instanceof RectCover) {
            const response = getCircleRectCollisionResponse(
              x,
              y,
              5, // небольшой радиус для луча
              obj.x,
              obj.y,
              obj.coverWidth,
              obj.coverHeight,
            );
            if (response) {
              return false; // Препятствие найдено
            }
          }
        }
      }

      currentDist += step;
    }

    return true; // Путь чист
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

  /** Проверка, застрял ли бот */
  private checkStuck(): boolean {
    // Сохраняем последние 10 позиций
    this.lastPositions.push({ x: this.x, y: this.y });
    if (this.lastPositions.length > 10) {
      this.lastPositions.shift();
    }

    if (this.lastPositions.length < 10) return false;

    // Вычисляем дистанцию между первой и последней позицией
    const first = this.lastPositions[0];
    const last = this.lastPositions[9];
    const dist = Math.sqrt((last.x - first.x) ** 2 + (last.y - first.y) ** 2);

    // Если за 10 шагов прошёл меньше 5 единиц - застрял
    return dist < 5;
  }

  /** Сбросить состояние застревания */
  private resetStuck(): void {
    this.lastPositions = [];
    this.stuckCounter = 0;
  }

  /** Проверка, может ли бот подобрать аптечку (без подбора) */
  canPickupItem(): boolean {
    if (!this.item) return false;
    const dx = this.x - this.item.x;
    const dy = this.y - this.item.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < HEALTH_PICKUP_RADIUS && !this.item.isCollected;
  }

  checkItemPickup() {
    if (!this.item) return false;
    const dx = this.x - this.item.x;
    const dy = this.y - this.item.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < HEALTH_PICKUP_RADIUS && !this.item.isCollected) {
      // Подбираем аптечку
      this.item.collect();
      return true;
    }

    return false;
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

    // Сбрасываем детекцию застревания
    this.resetStuck();
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
      if (this.hpText) this.hpText.text = String(this.hp);
    }

    // Коллизия с укрытиями (круглыми и прямоугольными)
    if (this.manager) {
      const nearby = this.manager.getNearbyObjects(
        this.x,
        this.y,
        COLLISION_COVER_RADIUS + COLLISION_BOT_RADIUS + 50, // +50 для прямоугольных
      );
      for (const obj of nearby) {
        // Круглые укрытия
        if (obj instanceof Cover) {
          if (
            circleCollision(
              this,
              obj,
              COLLISION_COVER_RADIUS + COLLISION_BOT_RADIUS,
            )
          ) {
            // Вычисляем направление отталкивания
            const dx = this.x - obj.x;
            const dy = this.y - obj.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;

            // Нормализуем и отталкиваем
            const overlap =
              COLLISION_COVER_RADIUS + COLLISION_BOT_RADIUS - dist;
            this.x += (dx / dist) * overlap;
            this.y += (dy / dist) * overlap;

            // Гасим скорость в направлении укрытия
            const nx = dx / dist;
            const ny = dy / dist;
            const dotProduct = this.vx * nx + this.vy * ny;
            if (dotProduct < 0) {
              this.vx -= nx * dotProduct;
              this.vy -= ny * dotProduct;
            }
          }
        }
        // Прямоугольные укрытия
        else if (obj instanceof RectCover) {
          const response = getCircleRectCollisionResponse(
            this.x,
            this.y,
            COLLISION_BOT_RADIUS,
            obj.x,
            obj.y,
            obj.coverWidth,
            obj.coverHeight,
          );
          if (response) {
            const { nx, ny, overlap } = response;
            // Отталкиваем бота
            this.x += nx * overlap;
            this.y += ny * overlap;

            // Гасим скорость в направлении укрытия
            const dotProduct = this.vx * nx + this.vy * ny;
            if (dotProduct < 0) {
              this.vx -= nx * dotProduct;
              this.vy -= ny * dotProduct;
            }
          }
        }
      }
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
    const prevX = this.x;
    const prevY = this.y;
    const closestBulletBefore = this.getClosestEnemyBulletDistance();
    const canPickupBefore = this.canPickupItem(); // Только проверка, без подбора
    const prevItemDist = this.getItemDistance();

    // Используем target network для стабильности
    let action = this.agent.actWithTarget(state);

    // Детекция застревания - добавляем рандомизацию
    if (this.checkStuck()) {
      this.stuckCounter++;
      // Если застрял больше 3 раз подряд - 50% шанс случайного действия
      if (this.stuckCounter > 3 && Math.random() < 0.5) {
        action = Math.floor(Math.random() * 6); // Случайное движение (0-5)
      }
    } else {
      this.resetStuck();
    }

    this.applyAction(action);

    const nextState = this.getState();

    let reward = RL_REWARD_STEP;

    // Штраф за выход за границы
    const outOfBounds = this.isOutOfBounds();
    if (outOfBounds) {
      reward += RL_REWARD_OUT_OF_BOUNDS;
    }

    if (this.hp <= 0) {
      this.agent.remember(state, action, RL_REWARD_DEATH, nextState, true);
      this.agent.incrementEpisode(); // Увеличиваем счётчик эпизодов
      this.logAction(action, reward, outOfBounds, false); // Логируем перед респавном
      this.respawn();
      return;
    }

    const closestBulletAfter = this.getClosestEnemyBulletDistance();
    if (closestBulletAfter > closestBulletBefore + 5)
      reward += RL_REWARD_AVOID_BULLET;

    if (this.hp < prevHp) reward += RL_REWARD_DAMAGE;

    // Награда за приближение к аптечке (чувствительный порог)
    const nextItemDist = this.getItemDistance();
    if (this.item && nextItemDist < prevItemDist - 0.5) {
      reward += RL_REWARD_APPROACH_ITEM;
    }

    // Штраф за бездействие (если бот почти не двигается И не движется к аптечке)
    const movedDist = Math.sqrt((this.x - prevX) ** 2 + (this.y - prevY) ** 2);
    if (movedDist < 0.5 && this.item) {
      // Штрафуем только если бот не движется к аптечке
      const approachingItem = nextItemDist < prevItemDist - 1;
      if (!approachingItem) {
        reward += RL_REWARD_IDLE;
      }
    }

    // Штраф за стрельбу сквозь стены
    if (
      this.shotThroughWall &&
      DQNAgent.globalSteps === this.lastShotStep + 1
    ) {
      reward += RL_REWARD_SHOOT_THROUGH_WALL;
      this.shotThroughWall = false; // Сбрасываем флаг после применения штрафа
    }

    // Подбор аптечки и награда
    const pickedUp = this.checkItemPickup(); // Теперь подбираем
    if (pickedUp && canPickupBefore) {
      // Бот был рядом с аптечкой и подобрал её
      reward += RL_REWARD_PICKUP_ITEM;
      this.agent.incrementEpisode(); // Считаем подбор как "эпизод" в режиме exploration
    }

    if (this.hpText) this.hpText.text = String(this.hp);

    this.agent.remember(state, action, reward, nextState, false);

    // Логируем действие
    this.logAction(action, reward, outOfBounds, pickedUp);

    // Увеличиваем глобальный счётчик шагов (один раз на все боты)
    if (this.id === this.manager?.bots[0]?.id) {
      DQNAgent.globalSteps++;
    }

    if (DQNAgent.globalSteps % RL_REPLAY_INTERVAL === 0) {
      this.agent.replay(32);
    }
  }

  /**
   * Записать действие в лог
   */
  private logAction(
    action: number,
    reward: number,
    isOutOfBounds: boolean,
    pickedUp: boolean,
  ): void {
    // Ограничиваем размер лога 1000 записей
    if (this.logs.length >= 1000) {
      this.logs.shift();
    }

    this.logs.push({
      step: DQNAgent.globalSteps,
      action,
      reward,
      hp: this.hp,
      x: this.x,
      y: this.y,
      hasEnemy: !!this.enemy,
      hasItem: !!this.item,
      itemDist: this.getItemDistance(),
      isOutOfBounds,
      shotThroughWall: this.shotThroughWall,
      pickedUp,
    });
  }

  /**
   * Получить логи поведения
   */
  getLogs(): BotLogEntry[] {
    return [...this.logs];
  }

  /**
   * Очистить логи
   */
  clearLogs(): void {
    this.logs = [];
  }
}
