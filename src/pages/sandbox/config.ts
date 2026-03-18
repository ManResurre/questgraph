// Размеры арены
export const ARENA_WIDTH = 800;
export const ARENA_HEIGHT = 600;

// Границы арены (отступы от краёв)
export const ARENA_MARGIN_X = 20;
export const ARENA_MARGIN_Y = 20;

// Эффективные границы для сущностей
export const ARENA_MIN_X = ARENA_MARGIN_X;
export const ARENA_MAX_X = ARENA_WIDTH - ARENA_MARGIN_X;
export const ARENA_MIN_Y = ARENA_MARGIN_Y;
export const ARENA_MAX_Y = ARENA_HEIGHT - ARENA_MARGIN_Y;

// Физика бота
export const BOT_ACCEL = 0.8;
export const BOT_FRICTION = 0.92;
export const BOT_MAX_SPEED = 4.5;
export const BOT_RADIUS = 20;

// Пули
export const BULLET_RADIUS = 5;
export const BULLET_MAX_SPEED = 8;
export const BULLET_DAMAGE = 10;
export const BULLET_SPAWN_DIST = 25;
export const MAX_BULLETS_PER_BOT = 2;
export const BULLET_POOL_SIZE = 50;

// Здоровье и аптечки
export const BOT_MAX_HP = 100;
export const BOT_START_HP = 100;
export const HEALTH_PICKUP_RADIUS = 25;
export const HEALTH_PICKUP_HEAL = 30;
export const HEALTH_RADIUS = 20;

// Рейкасты
export const RAY_COUNT = 12;
export const RAY_MAX_DIST = 300;
export const RAY_STEP = 4;

// Обучение RL
export const RL_GAMMA = 0.95;
export const RL_LEARNING_RATE = 0.001;
export const RL_MEMORY_SIZE = 5000;
export const RL_REPLAY_BATCH_SIZE = 32;
export const RL_REPLAY_INTERVAL = 60; // шагов между replay
export const RL_TARGET_UPDATE_INTERVAL = 100; // шагов между обновлениями target network
export const RL_KILLS_TO_COPY_BRAIN = 10;

// Параметры epsilon для exploration/exploitation
export const RL_EPSILON_START = 1.0;
export const RL_EPSILON_MIN = 0.01; // Уменьшено с 0.05 для лучшего exploration
export const RL_EPSILON_DECAY = 0.998; // Замедлено с 0.995 для более долгого exploration

// Награды
export const RL_REWARD_STEP = -0.01;
export const RL_REWARD_OUT_OF_BOUNDS = -5; // Увеличенный штраф за выход за границы
export const RL_REWARD_DAMAGE = -3;
export const RL_REWARD_DEATH = -10;
export const RL_REWARD_AVOID_BULLET = 0.5;
export const RL_REWARD_APPROACH_ITEM = 2; // Увеличено с 1.0 до 2.0 для лучшего обучения
export const RL_REWARD_PICKUP_ITEM = 20; // Увеличено с 15 до 20
export const RL_REWARD_IDLE = -0.3; // Уменьшено с -0.5 до -0.3
export const RL_REWARD_SHOOT_THROUGH_WALL = -2; // Штраф за стрельбу сквозь стены

// Коллизии
export const COLLISION_BOT_RADIUS = 20;
export const COLLISION_BULLET_RADIUS = 16;
export const COLLISION_ITEM_RADIUS = 20;
export const COLLISION_COVER_RADIUS = 20;

// Укрытия
export const COVER_TYPE_INDESTRUCTIBLE = "indestructible";
export const COVER_TYPE_DESTRUCTIBLE = "destructible";
export const COVER_DESTRUCTIBLE_HP = 100;
export const COVER_BULLET_DAMAGE = 10;

// Спавн
export const SPAWN_MIN_DIST_FROM_COVER = 40;
export const SPAWN_MIN_DIST_FROM_BOT = 60;
