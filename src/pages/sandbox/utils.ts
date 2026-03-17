import type { IPosition } from "./types";

export type Entity = IPosition;

export function circleCollision(a: Entity, b: Entity, radius = 16): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy < radius * radius;
}
