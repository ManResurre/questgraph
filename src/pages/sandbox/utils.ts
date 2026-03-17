import type { IPosition } from "./types";

export type Entity = IPosition;

export function circleCollision(a: Entity, b: Entity, radius = 16): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy < radius * radius;
}

/**
 * Проверка коллизии круга с прямоугольником (AABB)
 * @param circleX - центр круга по X
 * @param circleY - центр круга по Y
 * @param circleRadius - радиус круга
 * @param rectX - центр прямоугольника по X
 * @param rectY - центр прямоугольника по Y
 * @param rectWidth - ширина прямоугольника
 * @param rectHeight - высота прямоугольника
 */
export function circleRectCollision(
  circleX: number,
  circleY: number,
  circleRadius: number,
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number,
): boolean {
  // Находим ближайшую точку на прямоугольнике к центру круга
  const halfWidth = rectWidth / 2;
  const halfHeight = rectHeight / 2;

  // Ограничиваем координаты круга границами прямоугольника
  const closestX = Math.max(
    rectX - halfWidth,
    Math.min(circleX, rectX + halfWidth),
  );
  const closestY = Math.max(
    rectY - halfHeight,
    Math.min(circleY, rectY + halfHeight),
  );

  // Вычисляем расстояние от центра круга до ближайшей точки
  const dx = circleX - closestX;
  const dy = circleY - closestY;

  return dx * dx + dy * dy < circleRadius * circleRadius;
}

/**
 * Получить точку отталкивания круга от прямоугольника
 * Возвращает нормализованный вектор и глубину проникновения
 */
export function getCircleRectCollisionResponse(
  circleX: number,
  circleY: number,
  circleRadius: number,
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number,
): { nx: number; ny: number; overlap: number } | null {
  const halfWidth = rectWidth / 2;
  const halfHeight = rectHeight / 2;

  // Находим ближайшую точку на прямоугольнике
  const closestX = Math.max(
    rectX - halfWidth,
    Math.min(circleX, rectX + halfWidth),
  );
  const closestY = Math.max(
    rectY - halfHeight,
    Math.min(circleY, rectY + halfHeight),
  );

  // Вектор от ближайшей точки к центру круга
  const dx = circleX - closestX;
  const dy = circleY - closestY;

  const distSq = dx * dx + dy * dy;

  // Если нет коллизии
  if (distSq >= circleRadius * circleRadius) {
    return null;
  }

  const dist = Math.sqrt(distSq) || 1;
  const nx = dx / dist;
  const ny = dy / dist;
  const overlap = circleRadius - dist;

  return { nx, ny, overlap };
}
