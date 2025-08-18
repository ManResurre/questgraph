import {db, Quest, User} from "@/lib/db";
import {Dispatch, SetStateAction} from "react";
import {CryptHelper} from "@/lib/CryptHelper";

export interface IQuest {
    id?: number;
    name: string;
}

export class QuestService {
    static #instance: QuestService;
    editing: Quest | undefined;
    update: Dispatch<SetStateAction<string>>;
    user: User;

    private constructor() {
    }

    public static async init(update: Dispatch<SetStateAction<string>>): Promise<QuestService> {
        if (!QuestService.#instance) {
            QuestService.#instance = new QuestService();
        }

        QuestService.#instance.setUpdate(update);
        await QuestService.#instance.authUser();
        return QuestService.#instance;
    }

    setUpdate(update: Dispatch<SetStateAction<string>>) {
        this.update = update;
    }

    async authUser() {
        const userId = localStorage.getItem('userId');

        if (!userId) {
            return await this.regUser();
        }

        try {
            const [user] = await db.user.where('id').equals(userId).toArray();
            this.user = user;
        } catch (e) {
            await this.regUser();
        }
    }

    async regUser() {
        const {privateKey, publicKey} = await CryptHelper.generateRSAKeys();

        const publicKeyRow = await CryptHelper.exportKey(publicKey);
        const privateKeyRow = await CryptHelper.exportKey(privateKey, 'pkcs8');

        const userId = crypto.randomUUID();
        localStorage.setItem('userId', userId);

        this.user = {
            id: userId,
            name: "test",
            privateKey: privateKeyRow,
            publicKey: publicKeyRow
        };

        db.user.put(this.user)
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
