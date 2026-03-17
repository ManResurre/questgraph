import type { Bot } from "./Bot";
import type { Health } from "./Health";
import { circleCollision } from "./utils";
import {
  RAY_COUNT,
  RAY_MAX_DIST,
  RAY_STEP,
  COLLISION_BOT_RADIUS,
  COLLISION_COVER_RADIUS,
  COLLISION_ITEM_RADIUS,
} from "./config";

export function castRay(
  bot: Bot,
  angle: number,
  obstacles: Bot[],
  enemy: Bot | null,
  item: Health | null,
  maxDist = RAY_MAX_DIST,
): [number, number, number] {
  let dist = 0;

  let hitObstacle = 0;
  let hitEnemy = 0;
  let hitItem = 0;

  while (dist < maxDist) {
    const x = bot.x + Math.cos(angle) * dist;
    const y = bot.y + Math.sin(angle) * dist;

    // obstacle hit → early exit
    for (const obs of obstacles) {
      if (circleCollision({ x, y }, obs, COLLISION_COVER_RADIUS)) {
        hitObstacle = 1 - dist / maxDist;
        return [hitObstacle, hitEnemy, hitItem];
      }
    }

    if (enemy && circleCollision({ x, y }, enemy, COLLISION_BOT_RADIUS)) {
      hitEnemy = 1 - dist / maxDist;
    }

    if (item && circleCollision({ x, y }, item, COLLISION_ITEM_RADIUS)) {
      hitItem = 1 - dist / maxDist;
    }

    dist += RAY_STEP;
  }

  return [hitObstacle, hitEnemy, hitItem];
}

export function getRays(
  bot: Bot,
  obstacles: Bot[],
  enemy: Bot | null,
  item: Health | null,
): number[] {
  const rays: number[] = [];

  for (let i = 0; i < RAY_COUNT; i++) {
    const angle = (i / RAY_COUNT) * Math.PI * 2;
    const [obs, en, it] = castRay(bot, angle, obstacles, enemy, item);
    rays.push(obs, en, it);
  }

  return rays;
}
