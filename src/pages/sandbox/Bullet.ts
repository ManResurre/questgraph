import { Graphics } from "pixi.js";
import { circleCollision } from "./utils";
import { Bot } from "./Bot";

export class Bullet extends Graphics {
    vx = 0;
    vy = 0;
    owner: Bot | null = null;

    setPosition(x: number, y: number) {
        this.position.set(x, y);
        return this;
    }

    addOwner(owner: Bot) {
        this.owner = owner;
        return this;
    }

    addVelocity(vx: number, vy: number) {
        this.vx = vx;
        this.vy = vy;
        return this;
    }

    update(delta: number) {
        // если владелец умер или отсутствует — уничтожаем пулю
        if (!this.owner || !this.owner.enemy) {
            this.destroy();
            return false;
        }

        const enemy = this.owner.enemy;

        // движение
        this.x += this.vx * delta;
        this.y += this.vy * delta;

        // столкновение с врагом
        if (circleCollision(this, enemy, 16)) {
            enemy.hp = Math.max(0, enemy.hp - 10);

            // если враг умер — это смерть, бот сам обработает в update()
            this.destroy();
            return true;
        }

        // выход за экран
        if (this.x < 0 || this.x > 800 || this.y < 0 || this.y > 600) {
            this.destroy();
            return false;
        }

        return false;
    }
}
