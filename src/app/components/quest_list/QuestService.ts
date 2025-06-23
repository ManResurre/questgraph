import {db, Quest} from "@/lib/db";
import {Dispatch, SetStateAction} from "react";

export interface IQuest {
    id?: number;
    name: string;
}

export class QuestService {
    editing: Quest | undefined;
    update: Dispatch<SetStateAction<string>>;

    constructor(update: Dispatch<SetStateAction<string>>) {
        this.update = update;
    }

    async create<T extends Quest>(data: T) {
        if (this.editing) {
            this.editing.name = data.name;
            await db.quests.put(this.editing);
            this.editing = undefined;
            return;
        }

        await db.quests.add({
            name: data.name,
            masterKey: "",
            authorKey: ""
        })
    }

    async edit(quest: Quest) {
        this.editing = quest;
        this.update(`edit_quest_${quest.id}`);
    }

    async delete(quest: Quest) {
        await db.quests.delete(quest.id!);
    }
}
