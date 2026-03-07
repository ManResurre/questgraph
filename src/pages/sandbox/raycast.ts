import { CircleEntity } from "./CircleEntity";
import { circleCollision } from "./utils";

export function castRay(
    bot: CircleEntity,
    angle: number,
    obstacles: CircleEntity[],
    enemy: CircleEntity,
    item: CircleEntity,
    maxDist = 300
): [number, number, number] {
  const step = 4;
  let dist = 0;

  let hitObstacle = 0;
  let hitEnemy = 0;
  let hitItem = 0;

  while (dist < maxDist) {
    const x = bot.x + Math.cos(angle) * dist;
    const y = bot.y + Math.sin(angle) * dist;

    // obstacle hit → early exit
    for (const obs of obstacles) {
      if (circleCollision({ x, y }, obs, 20)) {
        hitObstacle = 1 - dist / maxDist;
        return [hitObstacle, hitEnemy, hitItem];
      }
    }

    if (circleCollision({ x, y }, enemy, 20)) {
      hitEnemy = 1 - dist / maxDist;
    }

    if (circleCollision({ x, y }, item, 20)) {
      hitItem = 1 - dist / maxDist;
    }

    dist += step;
  }

  return [hitObstacle, hitEnemy, hitItem];
}

export function getRays(
    bot: CircleEntity,
    obstacles: CircleEntity[],
    enemy: CircleEntity,
    item: CircleEntity
): number[] {
  const rays: number[] = [];
  const count = 12;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const [obs, en, it] = castRay(bot, angle, obstacles, enemy, item);
    rays.push(obs, en, it);
  }

  return rays;
}
