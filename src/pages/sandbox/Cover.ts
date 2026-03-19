import { Entity } from "./Entity";
import type { CoverType } from "./types";

/** Радиус неразрушимого укрытия */
const INDESTRUCTIBLE_RADIUS = 25;
/** Цвет неразрушимого укрытия (синий) */
const INDESTRUCTIBLE_COLOR = 0x4488ff;
/** Радиус разрушимого укрытия */
const DESTRUCTIBLE_RADIUS = 20;
/** Цвет разрушимого укрытия (красный) */
const DESTRUCTIBLE_COLOR = 0xff4444;

export class Cover extends Entity {
  /** Тип укрытия: неразрушимое или разрушимое */
  type: CoverType = "indestructible";

  /** Здоровье для разрушимых укрытий */
  hp: number = 100;

  /** Максимальное здоровье */
  maxHp: number = 100;

  /** Радиус укрытия */
  radius: number = INDESTRUCTIBLE_RADIUS;

  /**
   * Нарисовать укрытие
   */
  draw(): this {
    this.clear();
    this.circle(0, 0, this.radius);
    this.fill(
      this.type === "indestructible"
        ? INDESTRUCTIBLE_COLOR
        : DESTRUCTIBLE_COLOR,
    );
    this.restore();
    return this;
  }

  /**
   * Установить тип укрытия и перерисовать
   */
  setType(type: CoverType): this {
    this.type = type;
    // Устанавливаем размер в зависимости от типа
    this.radius =
      type === "indestructible" ? INDESTRUCTIBLE_RADIUS : DESTRUCTIBLE_RADIUS;
    // Перерисовываем
    this.draw();
    return this;
  }

  /**
   * Получить урон (для разрушимых укрытий)
   */
  takeDamage(damage: number): boolean {
    if (this.type !== "destructible") {
      return false; // неразрушимое — не получает урон
    }

    this.hp = Math.max(0, this.hp - damage);
    return this.hp <= 0; // возвращает true, если укрытие уничтожено
  }

  /**
   * Восстановить здоровье укрытия
   */
  repair(amount: number): this {
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return this;
  }
}
