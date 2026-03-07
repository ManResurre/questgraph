import { CircleEntity } from "./CircleEntity";
import { moveBot, circleCollision } from "./utils";
import { getRays } from "./raycast";
import { Bullet } from "./Bullet";

export class Environment {
  constructor(
      public bot: CircleEntity,
      public enemy: CircleEntity,
      public cover: CircleEntity,
      public item: CircleEntity,
      public bullets: Bullet[],
  ) {}

  getState(): number[] {
    const rays = getRays(this.bot, [this.cover], this.enemy, this.item);

    return [
      this.bot.x / 800,
      this.bot.y / 600,
      this.bot.hp ?? 1,
      this.bot.canShoot ? 1 : 0,
      ...rays,
    ];
  }

  step(action: number) {
    let reward = -0.01;
    const speed = 3;

    switch (action) {
      case 0: moveBot(this.bot, 0, -speed, [this.cover]); break;
      case 1: moveBot(this.bot, 0, speed, [this.cover]); break;
      case 2: moveBot(this.bot, -speed, 0, [this.cover]); break;
      case 3: moveBot(this.bot, speed, 0, [this.cover]); break;

      case 4:
        if (this.bot.canShoot) {
          this.bot.shoot?.();
          reward += 0.2;
        }
        break;

      case 5:
        moveBot(
            this.bot,
            (this.cover.x - this.bot.x) * 0.1,
            (this.cover.y - this.bot.y) * 0.1,
            [],
        );
        reward += 0.1;
        break;

      case 6:
        moveBot(
            this.bot,
            (this.item.x - this.bot.x) * 0.1,
            (this.item.y - this.bot.y) * 0.1,
            [],
        );
        reward += 0.3;
        break;
    }

    const distEnemy = Math.hypot(this.enemy.x - this.bot.x, this.enemy.y - this.bot.y);
    if (distEnemy < 50) reward -= 1;

    const distItem = Math.hypot(this.item.x - this.bot.x, this.item.y - this.bot.y);
    if (distItem < 20) reward += 1;

    return { reward, done: false };
  }
}
