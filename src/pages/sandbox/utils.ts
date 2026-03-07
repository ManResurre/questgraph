import { CircleEntity } from "./CircleEntity";
import { Bullet } from "./Bullet";

export type Entity = CircleEntity | Bullet | { x: number; y: number };

export function circleCollision(a: Entity, b: Entity, radius = 20): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy < radius * radius;
}

export function moveBot(
    bot: CircleEntity,
    dx: number,
    dy: number,
    obstacles: CircleEntity[],
) {
  const oldX = bot.x;
  const oldY = bot.y;

  bot.x += dx;
  bot.y += dy;

  for (const obs of obstacles) {
    if (circleCollision(bot, obs, 40)) {
      bot.x = oldX;
      bot.y = oldY;
      break;
    }
  }
}
