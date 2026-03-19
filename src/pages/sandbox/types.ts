import type { Bot } from "./Bot";
import type { Bullet } from "./Bullet";
import type { Cover } from "./Cover";
import type { DQNAgent } from "./DQNAgent";
import type { Entity } from "./Entity";
import type { Health } from "./Health";

/** Тип укрытия */
export type CoverType = "indestructible" | "destructible";

/** Базовая сущность с позицией */
export interface IPosition {
  x: number;
  y: number;
}

/** Сущность со здоровьем */
export interface IHasHealth {
  hp: number;
  maxHp: number;
}

/** Сущность с физикой (скорость, ускорение) */
export interface IHasPhysics {
  vx: number;
  vy: number;
  accel: number;
  friction: number;
  maxSpeed: number;
}

/** Сущность, которая может обновляться */
export interface IUpdatable {
  update(delta: number): void;
}

/** Сущность, которая может уничтожаться */
export interface IDestroyable {
  destroyed: boolean;
  destroy(): void;
}

/** Интерфейс для бота */
export interface IBot extends IHasHealth, IHasPhysics {
  id: number;
  canShoot: boolean;
  enemy: Bot | null;
  item: Health | null;
  kills: number;
  /** RL-агент */
  agent: DQNAgent;
  /** Получить состояние для RL */
  getState(): number[];
  /** Применить действие RL */
  applyAction(action: number): void;
  /** Обновить физику */
  updatePhysics(delta: number): void;
}

/** Интерфейс для пули */
export interface IBullet extends IHasPhysics {
  ax: number;
  ay: number;
  owner: Bot | null;
}

/** Интерфейс для аптечки */
export interface IHealthItem extends IUpdatable {
  respawn(): void;
}

/** Интерфейс для укрытия */
export interface ICover extends IPosition {}

/** Интерфейс RL-агента */
export interface IDQNAgent {
  stateSize: number;
  actionSize: number;
  gamma: number;
  epsilon: number;
  epsilonMin: number;
  epsilonDecay: number;
  learningRate: number;
  /** Получить действие */
  act(state: number[]): number;
  /** Запомнить опыт */
  remember(
    state: number[],
    action: number,
    reward: number,
    nextState: number[],
    done: boolean,
  ): void;
  /** Replay buffer */
  replay(batchSize?: number): Promise<void>;
}

/** Опыт для RL памяти */
export interface RLExperience {
  state: number[];
  action: number;
  reward: number;
  nextState: number[];
  done: boolean;
}

// Экспорт классов для удобства
export type { Entity, Bot, Bullet, Health, Cover, DQNAgent };
