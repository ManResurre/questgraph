import { Graphics } from "pixi.js";
import { circleCollision } from "./utils";
import { EntityManager } from "./EntityManager";

export class Health extends Graphics {
    manager: EntityManager | null = null;

    setPosition(x: number, y: number) {
        this.position.set(x, y);
        return this;
    }

    respawn() {
        if (!this.manager) return;

        let x: number, y: number;

        for (;;) {
            x = Math.random() * 760 + 20;
            y = Math.random() * 560 + 20;

            let bad = false;

            for (const cover of this.manager.covers) {
                if (circleCollision({ x, y }, cover, 40)) {
                    bad = true;
                    break;
                }
            }

            if (bad) continue;

            for (const bot of this.manager.bots) {
                if (circleCollision({ x, y }, bot, 60)) {
                    bad = true;
                    break;
                }
            }

            if (!bad) break;
        }

        this.setPosition(x, y);
    }
}
