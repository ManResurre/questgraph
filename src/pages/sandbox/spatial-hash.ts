import type { Bot } from "./Bot";
import type { Cover } from "./Cover";
import type { RectCover } from "./RectCover";
import type { Health } from "./Health";

/** Общий тип для укрытий */
export type CoverEntity = Cover | RectCover;

/**
 * Spatial Hash для быстрой проверки коллизий
 * Разбивает пространство на ячейки и хранит объекты в соответствующих ячейках
 */
export class SpatialHash {
  /** Размер ячейки */
  private cellSize: number;

  /** Хэш: ключ (x,y) -> массив объектов */
  private grid: Map<string, Array<Bot | Cover | RectCover | Health>> =
    new Map();

  constructor(cellSize: number = 100) {
    this.cellSize = cellSize;
  }

  /** Получить ключ ячейки по координатам */
  private getKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  /** Очистить хэш */
  clear(): void {
    this.grid.clear();
  }

  /** Добавить объект в хэш */
  insert(obj: Bot | Cover | RectCover | Health): void {
    const key = this.getKey(obj.x, obj.y);
    let cell = this.grid.get(key);
    if (!cell) {
      cell = [];
      this.grid.set(key, cell);
    }
    cell.push(obj);
  }

  /** Добавить несколько объектов */
  insertMany(objects: Array<Bot | Cover | RectCover | Health>): void {
    for (const obj of objects) {
      this.insert(obj);
    }
  }

  /** Получить объекты из ячейки и соседних ячеек */
  getNearby(
    x: number,
    y: number,
    radius: number,
  ): Array<Bot | Cover | RectCover | Health> {
    const result: Array<Bot | Cover | RectCover | Health> = [];
    const cellsNeeded = Math.ceil(radius / this.cellSize);

    const centerX = Math.floor(x / this.cellSize);
    const centerY = Math.floor(y / this.cellSize);

    for (let dx = -cellsNeeded; dx <= cellsNeeded; dx++) {
      for (let dy = -cellsNeeded; dy <= cellsNeeded; dy++) {
        const key = `${centerX + dx},${centerY + dy}`;
        const cell = this.grid.get(key);
        if (cell) {
          result.push(...cell);
        }
      }
    }

    return result;
  }

  /** Получить объекты в радиусе от точки (с точной проверкой расстояния) */
  getInRadius(
    x: number,
    y: number,
    radius: number,
  ): Array<Bot | Cover | RectCover | Health> {
    const nearby = this.getNearby(x, y, radius);
    const radiusSq = radius * radius;
    return nearby.filter((obj) => {
      const dx = obj.x - x;
      const dy = obj.y - y;
      return dx * dx + dy * dy <= radiusSq;
    });
  }

  /** Получить количество объектов в хэше */
  size(): number {
    let count = 0;
    for (const cell of this.grid.values()) {
      count += cell.length;
    }
    return count;
  }

  /** Получить количество заполненных ячеек */
  occupiedCells(): number {
    return this.grid.size;
  }
}
