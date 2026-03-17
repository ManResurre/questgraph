import { Application } from "pixi.js";
import { Bot } from "./Bot";
import { Health } from "./Health";
import { Cover } from "./Cover";
import { RectCover } from "./RectCover";
import { Bullet, BulletPool } from "./Bullet";
import { SpatialHash } from "./spatial-hash";
import {
  ARENA_WIDTH,
  ARENA_HEIGHT,
  RL_KILLS_TO_COPY_BRAIN,
  COLLISION_BOT_RADIUS,
} from "./config";

/** Общий тип для всех укрытий */
export type CoverEntity = Cover | RectCover;

export class EntityManager {
  bots: Bot[] = [];
  items: Health[] = [];
  covers: CoverEntity[] = [];

  /** Пул пуль вместо массива */
  bulletPool!: BulletPool;

  /** Spatial Hash для быстрой проверки коллизий */
  spatialHash!: SpatialHash;

  updateQueue: Bot[] = [];

  app: Application | null = null;

  setApp(app: Application) {
    this.app = app;
    this.bulletPool = new BulletPool();
    this.spatialHash = new SpatialHash(100);
  }

  addBot(bot: Bot) {
    this.bots.push(bot);
    bot.manager = this;
    return this;
  }

  removeBot(bot: Bot) {
    const i = this.bots.indexOf(bot);
    if (i !== -1) {
      bot.destroy();
      this.bots.splice(i, 1);
    }
  }

  spawnBot() {
    if (!this.app) return;

    const bot = new Bot()
      .circle(0, 0, 20)
      .fill(0xffffff * Math.random())
      .restore()
      .setPosition(
        Math.random() * (ARENA_WIDTH - 40) + 20,
        Math.random() * (ARENA_HEIGHT - 40) + 20,
      )
      .bot(100, true)
      .addBrain();

    this.addBot(bot);
    this.app.stage.addChild(bot);

    return bot;
  }

  setBotCount(n: number) {
    while (this.bots.length < n) {
      this.spawnBot();
    }

    while (this.bots.length > n) {
      const bot = this.bots[this.bots.length - 1];
      this.removeBot(bot);
    }

    // пересобираем очередь
    this.updateQueue = [...this.bots];
  }

  addItem(item: Health) {
    this.items.push(item);
    item.manager = this;
    return this;
  }

  addCover(cover: CoverEntity) {
    this.covers.push(cover);
    return this;
  }

  removeCover(cover: CoverEntity) {
    const i = this.covers.indexOf(cover);
    if (i !== -1) {
      cover.destroy();
      this.covers.splice(i, 1);
    }
  }

  /** Получить пул пуль */
  getBulletPool(): BulletPool {
    return this.bulletPool;
  }

  /** Получить активные пули */
  getBullets(): Bullet[] {
    return this.bulletPool.getActive();
  }

  /** Обновить spatial hash */
  updateSpatialHash(): void {
    this.spatialHash.clear();
    this.spatialHash.insertMany([...this.bots, ...this.covers, ...this.items]);
  }

  /** Получить ближайшие объекты для проверки коллизий */
  getNearbyObjects(x: number, y: number, radius: number) {
    return this.spatialHash.getNearby(x, y, radius);
  }

  // ближайший враг (с использованием spatial hash)
  getEnemy(forBot: Bot): Bot | null {
    let best: Bot | null = null;
    let bestDist = Infinity;

    // Используем spatial hash для получения только близких ботов
    const nearby = this.spatialHash.getNearby(forBot.x, forBot.y, 400);

    for (const obj of nearby) {
      if (obj === forBot || !(obj instanceof Bot)) continue;

      const dx = obj.x - forBot.x;
      const dy = obj.y - forBot.y;
      const dist = dx * dx + dy * dy; // используем квадрат расстояния

      if (dist < bestDist) {
        bestDist = dist;
        best = obj;
      }
    }

    return best;
  }

  getClosestItem(forBot: Bot): Health | null {
    let best: Health | null = null;
    let bestDist = Infinity;

    // Используем spatial hash
    const nearby = this.spatialHash.getNearby(forBot.x, forBot.y, 400);

    for (const obj of nearby) {
      if (!(obj instanceof Health)) continue;

      const dx = obj.x - forBot.x;
      const dy = obj.y - forBot.y;
      const dist = dx * dx + dy * dy;

      if (dist < bestDist) {
        bestDist = dist;
        best = obj;
      }
    }

    return best;
  }

  // копирование мозга лучшего бота
  copyBrainToAll(source: Bot) {
    const weights = source.agent.model.getWeights();

    for (const bot of this.bots) {
      if (bot === source) continue;
      bot.agent.model.setWeights(weights);
    }
  }

  // главный update — ОЧЕРЕДЬ
  update(delta: number) {
    // 1. Обновляем spatial hash
    this.updateSpatialHash();

    // 2. Пули — каждый кадр (обновляем через пул)
    this.bulletPool.update(delta);

    // 3. Физика — каждый кадр
    for (const bot of this.bots) {
      bot.updatePhysics(delta);
    }

    // 4. Если очередь пуста — пересобираем
    if (this.updateQueue.length === 0) {
      this.updateQueue = [...this.bots];
    }

    // 5. Достаём одного бота
    const bot = this.updateQueue.shift();
    if (!bot) return;

    // 6. RL-обновление только одного бота
    bot.update(delta);

    // 7. Проверка фрагов
    if (bot.kills >= RL_KILLS_TO_COPY_BRAIN) {
      console.log("БОТ", bot.id, "СТАЛ ЛУЧШИМ — КОПИРУЕМ МОЗГ");
      this.copyBrainToAll(bot);
      for (const b of this.bots) {
        b.kills = 0;
      }
    }
  }
}
