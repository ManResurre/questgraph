import { Container, Graphics, GraphicsContext } from "pixi.js";
import type { EntityManager } from "./EntityManager";

/** Базовая сущность для всех игровых объектов */
export class Entity extends Container {
  /** Ссылка на менеджер сущностей */
  manager: EntityManager | null = null;

  /** Графический объект для отрисовки */
  protected _graphics: Graphics;

  /** Флаг уничтожения */
  destroyed: boolean = false;

  constructor() {
    super();
    this._graphics = new Graphics();
    this.addChild(this._graphics);
  }

  /** Получить или создать контекст графики */
  protected get graphicsContext(): GraphicsContext {
    return this._graphics.context;
  }

  /** Нарисовать прямоугольник */
  rect(x: number, y: number, w: number, h: number): this {
    this._graphics.rect(x, y, w, h);
    return this;
  }

  /** Нарисовать круг */
  circle(x: number, y: number, radius: number): this {
    this.graphicsContext.circle(x, y, radius);
    return this;
  }

  /** Заполнить цветом */
  fill(color: number): this {
    this.graphicsContext.fill({ color });
    return this;
  }

  /** Восстановить контекст для отрисовки */
  restore(): this {
    this.graphicsContext.restore();
    return this;
  }

  /** Очистить графику */
  clear(): this {
    this.graphicsContext.clear();
    return this;
  }

  /** Установить позицию */
  setPosition(x: number, y: number): this {
    this.position.set(x, y);
    return this;
  }

  /** Обновить состояние (переопределяется в наследниках) */
  update(_delta: number): void {
    // по умолчанию ничего не делает
  }

  /** Уничтожить сущность */
  destroy(): void {
    this.destroyed = true;
    if (this.parent) {
      this.parent.removeChild(this);
    }
  }
}
