import { Application } from "pixi.js";
import { Bot } from "./Bot";
import { Health } from "./Health";
import { Cover } from "./Cover";
import { Bullet } from "./Bullet";
import { ARENA_WIDTH, ARENA_HEIGHT, RL_KILLS_TO_COPY_BRAIN } from "./config";

export class EntityManager {
  bots: Bot[] = [];
  items: Health[] = [];
  covers: Cover[] = [];
  bullets: Bullet[] = [];

  updateQueue: Bot[] = [];

  app: Application | null = null;

  setApp(app: Application) {
    this.app = app;
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

  addCover(cover: Cover) {
    this.covers.push(cover);
    return this;
  }

  updateBullets(delta: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.update(delta);

      if (b.destroyed) {
        this.bullets.splice(i, 1);
      }
    }
  }

  // ближайший враг
  getEnemy(forBot: Bot): Bot | null {
    let best: Bot | null = null;
    let bestDist = Infinity;

    for (const bot of this.bots) {
      if (bot === forBot) continue;

      const dx = bot.x - forBot.x;
      const dy = bot.y - forBot.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < bestDist) {
        bestDist = dist;
        best = bot;
      }
    }

    return best;
  }

  getClosestItem(forBot: Bot): Health | null {
    let best: Health | null = null;
    let bestDist = Infinity;

    for (const item of this.items) {
      const dx = item.x - forBot.x;
      const dy = item.y - forBot.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = item;
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
    // 1. Пули — каждый кадр
    this.updateBullets(delta);

    // 2. Физика — каждый кадр
    for (const bot of this.bots) {
      bot.updatePhysics(delta);
    }

    // 3. Если очередь пуста — пересобираем
    if (this.updateQueue.length === 0) {
      this.updateQueue = [...this.bots];
    }

    // 4. Достаём одного бота
    const bot = this.updateQueue.shift();
    if (!bot) return;

    // 5. RL-обновление только одного бота
    bot.update();

    // 6. Проверка фрагов
    if (bot.kills >= RL_KILLS_TO_COPY_BRAIN) {
      console.log("БОТ", bot.id, "СТАЛ ЛУЧШИМ — КОПИРУЕМ МОЗГ");
      this.copyBrainToAll(bot);
      for (const b of this.bots) {
        b.kills = 0;
      }
    }
  }
}
