import type { Bot } from "./Bot";
import {
  RAY_COUNT,
  RAY_MAX_DIST,
  RAY_STEP,
  COLLISION_BOT_RADIUS,
  COLLISION_COVER_RADIUS,
  COLLISION_ITEM_RADIUS,
} from "./config";
import { Cover } from "./Cover";
import type { EntityManager } from "./EntityManager";
import type { Health } from "./Health";
import { circleCollision } from "./utils";
const CACHED_RAY_ANGLES: number[] = [];
for (let i = 0; i < RAY_COUNT; i++) {
  CACHED_RAY_ANGLES.push((i / RAY_COUNT) * Math.PI * 2);
}

/** Предварительно вычисленные sin/cos для углов лучей */
const CACHED_RAY_COS: number[] = [];
const CACHED_RAY_SIN: number[] = [];
for (let i = 0; i < RAY_COUNT; i++) {
  const angle = CACHED_RAY_ANGLES[i];
  CACHED_RAY_COS.push(Math.cos(angle));
  CACHED_RAY_SIN.push(Math.sin(angle));
}

export function castRay(
  bot: Bot,
  angleIndex: number,
  manager: EntityManager,
  enemy: Bot | null,
  item: Health | null,
  maxDist = RAY_MAX_DIST,
  cosVal: number,
  sinVal: number,
): [number, number, number] {
  let dist = 0;

  let hitObstacle = 0;
  let hitEnemy = 0;
  let hitItem = 0;

  while (dist < maxDist) {
    const x = bot.x + cosVal * dist;
    const y = bot.y + sinVal * dist;

    // Получаем nearby объекты из spatial hash
    const nearby = manager.getNearbyObjects(x, y, COLLISION_COVER_RADIUS);

    // obstacle hit → early exit
    for (const obj of nearby) {
      if (obj instanceof Cover) {
        if (circleCollision({ x, y }, obj, COLLISION_COVER_RADIUS)) {
          hitObstacle = 1 - dist / maxDist;
          return [hitObstacle, hitEnemy, hitItem];
        }
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

/** Пул массивов для результатов raycasting (избегаем аллокаций) */
const RAYS_ARRAY_POOL: number[][] = [];
const POOL_SIZE = 10;

// Инициализация пула
for (let i = 0; i < POOL_SIZE; i++) {
  RAYS_ARRAY_POOL.push(new Array(RAY_COUNT * 3));
}

let poolIndex = 0;

/**
 * Получить массив из пула или создать новый
 */
function acquireRaysArray(): number[] {
  const arr = RAYS_ARRAY_POOL[poolIndex];
  poolIndex = (poolIndex + 1) % POOL_SIZE;
  // Очищаем массив перед использованием
  arr.fill(0);
  return arr;
}

export function getRays(
  bot: Bot,
  manager: EntityManager,
  enemy: Bot | null,
  item: Health | null,
): number[] {
  const rays = acquireRaysArray();
  let rayIdx = 0;

  for (let i = 0; i < RAY_COUNT; i++) {
    const [obs, en, it] = castRay(
      bot,
      i,
      manager,
      enemy,
      item,
      RAY_MAX_DIST,
      CACHED_RAY_COS[i],
      CACHED_RAY_SIN[i],
    );
    rays[rayIdx++] = obs;
    rays[rayIdx++] = en;
    rays[rayIdx++] = it;
  }

  return rays;
}
