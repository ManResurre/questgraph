import { Bot } from "./Bot.ts";
import { Bullet } from "./Bullet";

export type Entity = Bot | Bullet | { x: number; y: number };

export function circleCollision(a: Entity, b: Entity, radius = 16): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy < radius * radius;
}


