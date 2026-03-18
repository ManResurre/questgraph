import { Entity } from "./Entity";
import type { CoverType } from "./types";

/** Ширина неразрушимого укрытия */
const INDESTRUCTIBLE_WIDTH = 80;
/** Высота неразрушимого укрытия */
const INDESTRUCTIBLE_HEIGHT = 20;
/** Цвет неразрушимого укрытия (синий) */
const INDESTRUCTIBLE_COLOR = 0x4488ff;
/** Ширина разрушимого укрытия */
const DESTRUCTIBLE_WIDTH = 60;
/** Высота разрушимого укрытия */
const DESTRUCTIBLE_HEIGHT = 20;
/** Цвет разрушимого укрытия (красный) */
const DESTRUCTIBLE_COLOR = 0xff4444;

export class RectCover extends Entity {
  /** Тип укрытия: неразрушимое или разрушимое */
  type: CoverType = "indestructible";

  /** Здоровье для разрушимых укрытий */
  hp: number = 100;

  /** Максимальное здоровье */
  maxHp: number = 100;

  /** Ширина укрытия */
  coverWidth: number = INDESTRUCTIBLE_WIDTH;

  /** Высота укрытия */
  coverHeight: number = INDESTRUCTIBLE_HEIGHT;

  /**
   * Нарисовать прямоугольное укрытие
   */
  draw(): this {
    this.clear();
    this.rect(
      -this.coverWidth / 2,
      -this.coverHeight / 2,
      this.coverWidth,
      this.coverHeight,
    );
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
    if (type === "indestructible") {
      this.coverWidth = INDESTRUCTIBLE_WIDTH;
      this.coverHeight = INDESTRUCTIBLE_HEIGHT;
    } else {
      this.coverWidth = DESTRUCTIBLE_WIDTH;
      this.coverHeight = DESTRUCTIBLE_HEIGHT;
    }
    // Перерисовываем
    this.draw();
    return this;
  }

  /**
   * Установить размеры укрытия
   */
  setSize(width: number, height: number): this {
    this.coverWidth = width;
    this.coverHeight = height;
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

  /**
   * Получить границы укрытия (AABB)
   */
  getCoverBounds(): {
    left: number;
    right: number;
    top: number;
    bottom: number;
  } {
    return {
      left: this.x - this.coverWidth / 2,
      right: this.x + this.coverWidth / 2,
      top: this.y - this.coverHeight / 2,
      bottom: this.y + this.coverHeight / 2,
    };
  }
}
