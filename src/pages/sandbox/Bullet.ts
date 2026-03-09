import {Graphics} from "pixi.js";
import {circleCollision} from "./utils";
import {Bot} from "./Bot";

export class Bullet extends Graphics {
    vx = 0;
    vy = 0;

    ax = 0;
    ay = 0;

    maxSpeed = 8;

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
        if (!this.owner || !this.owner.enemy) {
            this.destroy();
            return;
        }

        const enemy = this.owner.enemy;

        this.vx += this.ax * delta;
        this.vy += this.ay * delta;

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }

        this.x += this.vx * delta;
        this.y += this.vy * delta;

        if (circleCollision(this, enemy, 16)) {
            enemy.hp = Math.max(0, enemy.hp - 10);
            if (enemy.hp <= 0 && this.owner) {
                this.owner.kills++;
            }
            this.destroy();
            return;
        }

        if (this.x < 0 || this.x > 800 || this.y < 0 || this.y > 600) {
            this.destroy();
        }
    }
}
