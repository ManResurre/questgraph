import {Graphics, HTMLText} from "pixi.js";
import {DQNAgent} from "./DQNAgent";
import {getRays} from "./raycast";
import {Bullet} from "./Bullet";
import {Health} from "./Health";
import {EntityManager} from "./EntityManager";

export class Bot extends Graphics {
    id = 0;
    hp = 100;
    canShoot = false;

    agent: DQNAgent;

    enemy: Bot | null = null;
    item: Health | null = null;

    manager: EntityManager | null = null;

    hpText: HTMLText | null = null;

    vx = 0;
    vy = 0;
    accel = 0.8;
    friction = 0.92;
    maxSpeed = 4.5;

    kills = 0;

    // глобальный счётчик шагов для обучения
    static globalStep = 0;

    constructor() {
        super();
        this.id = Math.floor(Math.random() * 10000);
    }

    setPosition(x: number, y: number) {
        this.position.set(x, y);
        return this;
    }

    bot(hp: number, canShoot: boolean) {
        this.hp = hp;
        this.canShoot = canShoot;

        if (!this.hpText) {
            this.hpText = new HTMLText({
                text: String(this.hp),
                style: {
                    fontSize: 14,
                    fill: "#ffffff",
                    fontWeight: "bold",
                    align: "center"
                }
            });

            this.hpText.anchor.set(0.5);
            this.hpText.position.set(0, 0);

            this.addChild(this.hpText);
        }

        this.hpText.text = String(this.hp);

        return this;
    }

    addBrain() {
        this.agent = new DQNAgent(44, 8);
        return this;
    }

    getState() {
        const enemy = this.enemy;
        const item = this.item;
        const obstacles = this.manager?.covers ?? [];

        const nx = this.x / 800;
        const ny = this.y / 600;

        const ex = enemy ? enemy.x / 800 : 0;
        const ey = enemy ? enemy.y / 600 : 0;

        const ix = item ? item.x / 800 : 0;
        const iy = item ? item.y / 600 : 0;

        const hpNorm = this.hp / 100;
        const canShootNorm = this.canShoot ? 1 : 0;

        const rays = getRays(this, obstacles as any, enemy as any, item as any);

        return [
            nx, ny,
            ex, ey,
            ix, iy,
            hpNorm,
            canShootNorm,
            ...rays
        ];
    }

    applyAction(action: number) {
        switch (action) {
            case 0: this.vx -= this.accel; break;
            case 1: this.vx += this.accel; break;
            case 2: this.vy -= this.accel; break;
            case 3: this.vy += this.accel; break;
            case 4: this.tryShoot(); break;
            case 5: break;
            case 6: if (this.item) this.moveToward(this.item); break;
            case 7: if (this.enemy) this.moveAway(this.enemy); break;
        }
    }

    moveToward(target: Graphics) {
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        this.vx += (dx / len) * this.accel;
        this.vy += (dy / len) * this.accel;
    }

    moveAway(target: Bot) {
        const dx = this.x - target.x;
        const dy = this.y - target.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        this.vx += (dx / len) * this.accel;
        this.vy += (dy / len) * this.accel;
    }

    tryShoot() {
        if (!this.canShoot || !this.enemy) return;
        if (!this.manager) return;

        if (this.manager.bullets.filter(b => b.owner === this).length > 2) return;

        const dx = this.enemy.x - this.x;
        const dy = this.enemy.y - this.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;

        const speed = 6;
        const vx = (dx / len) * speed;
        const vy = (dy / len) * speed;

        const spawnDist = 25;
        const spawnX = this.x + (dx / len) * spawnDist;
        const spawnY = this.y + (dy / len) * spawnDist;

        const bullet = new Bullet()
            .circle(0, 0, 5)
            .fill(0xffffff)
            .setPosition(spawnX, spawnY)
            .addOwner(this)
            .addVelocity(vx, vy);

        this.parent?.addChild(bullet);
        this.manager.bullets.push(bullet);
    }

    getClosestEnemyBulletDistance() {
        if (!this.enemy || !this.manager) return 999;

        let minDist = 999;

        for (const b of this.manager.bullets) {
            if (b.owner === this.enemy) {
                const dx = b.x - this.x;
                const dy = b.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist) minDist = dist;
            }
        }

        return minDist;
    }

    getItemDistance() {
        if (!this.item) return 999;
        const dx = this.x - this.item.x;
        const dy = this.y - this.item.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    checkItemPickup() {
        if (!this.item) return false;
        const dx = this.x - this.item.x;
        const dy = this.y - this.item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < 25;
    }

    isOutOfBounds() {
        return this.x < 0 || this.x > 800 || this.y < 0 || this.y > 600;
    }

    respawn() {
        this.x = Math.random() * 760 + 20;
        this.y = Math.random() * 560 + 20;

        this.hp = 100;

        if (this.hpText) {
            this.hpText.text = "100";
        }

        this.vx = 0;
        this.vy = 0;
    }

    updatePhysics(delta: number) {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > this.maxSpeed) {
            this.vx = (this.vx / speed) * this.maxSpeed;
            this.vy = (this.vy / speed) * this.maxSpeed;
        }

        this.x += this.vx * delta;
        this.y += this.vy * delta;

        this.vx *= this.friction;
        this.vy *= this.friction;

        if (this.item && this.checkItemPickup()) {
            this.hp = Math.min(100, this.hp + 30);
            this.item.respawn();
            if (this.hpText) this.hpText.text = String(this.hp);
        }

        const minX = 20;
        const maxX = 780;
        const minY = 20;
        const maxY = 580;

        if (this.x < minX) {
            this.x = minX;
            this.vx = Math.abs(this.vx) * 0.4;
        }
        if (this.x > maxX) {
            this.x = maxX;
            this.vx = -Math.abs(this.vx) * 0.4;
        }
        if (this.y < minY) {
            this.y = minY;
            this.vy = Math.abs(this.vy) * 0.4;
        }
        if (this.y > maxY) {
            this.y = maxY;
            this.vy = -Math.abs(this.vy) * 0.4;
        }
    }

    // -----------------------------
    // UPDATE RL
    // -----------------------------
    update() {
        if (this.manager) {
            this.enemy = this.manager.getEnemy(this);
            this.item = this.manager.getClosestItem(this);
        }

        const state = this.getState();

        const prevHp = this.hp;
        const closestBulletBefore = this.getClosestEnemyBulletDistance();
        const pickedUpBefore = this.checkItemPickup();
        const prevItemDist = this.getItemDistance();

        const action = this.agent.act(state);
        this.applyAction(action);

        const nextState = this.getState();

        let reward = -0.01;

        if (this.isOutOfBounds()) reward -= 1;

        if (this.hp <= 0) {
            this.agent.remember(state, action, -10, nextState, true);
            this.respawn();
            return;
        }

        const closestBulletAfter = this.getClosestEnemyBulletDistance();
        if (closestBulletAfter > closestBulletBefore + 5) reward += 0.5;

        if (this.hp < prevHp) reward -= 3;

        const nextItemDist = this.getItemDistance();
        if (nextItemDist < prevItemDist - 2) reward += 0.2;

        const pickedUpAfter = this.checkItemPickup();
        if (!pickedUpBefore && pickedUpAfter && this.item) {
            reward += 5;
            this.hp = Math.min(100, this.hp + 30);
            this.item.respawn();
        }

        if (this.hpText) this.hpText.text = String(this.hp);

        this.agent.remember(state, action, reward, nextState, false);

        Bot.globalStep++;
        if (Bot.globalStep % 10 === 0) {
            this.agent.replay(32);
        }
    }
}
