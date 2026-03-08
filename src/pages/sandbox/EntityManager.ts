import { Bot } from "./Bot";
import { Health } from "./Health";
import { Cover } from "./Cover";

export class EntityManager {
    bots: Bot[] = [];
    items: Health[] = [];
    covers: Cover[] = [];

    addBot(bot: Bot) {
        this.bots.push(bot);
        bot.manager = this;
        return this;
    }

    addItem(item: Health) {
        this.items.push(item);
        item.manager = this;
        return this;
    }

    addCover(cover: Cover) {
        this.covers.push(cover);
        return this;
    }

    getEnemy(forBot: Bot): Bot | null {
        return this.bots.find(b => b !== forBot) ?? null;
    }

    getClosestItem(forBot: Bot): Health | null {
        let best: Health | null = null;
        let bestDist = Infinity;

        for (const item of this.items) {
            const dx = item.x - forBot.x;
            const dy = item.y - forBot.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < bestDist) {
                bestDist = dist;
                best = item;
            }
        }

        return best;
    }
}
