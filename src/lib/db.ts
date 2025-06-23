import Dexie from 'dexie';

export interface User {
    id?: number;
    name: string;
    privateKey: string;
    publicKey: string;
}

export interface Choice {
    id?: number;
    sceneId: number;
    label: string;
    text: string;
    nextSceneId: number;
}

export interface Scene {
    id?: number;
    name: string;
    text: string;
    questId: number;
}

export interface Param {
    id?: number;
    label: string;
    questId: number;
}

export interface Quest {
    id?: number;
    name: string;
    authorKey: string;
    masterKey: string;
}

export class QuestsDB extends Dexie {
    user!: Dexie.Table<User, number>;
    quests!: Dexie.Table<Quest, number>;
    scenes!: Dexie.Table<Scene, number>;
    choices!: Dexie.Table<Choice, number>;
    params!: Dexie.Table<Param, number>;

    constructor() {
        super('QuestsDB');
        this.version(1).stores({
            user: '++id',
            quests: '++id',
            choices: '++id, sceneId',
            scenes: '++id, questId', // Индекс по questId для быстрого поиска
            params: '++id, questId'  // Индекс по questId
        });
    }
}

export const db = new QuestsDB();
