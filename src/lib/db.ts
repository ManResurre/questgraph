import Dexie from 'dexie';

export interface User {
    id?: number;
    name: string;
    privateKey: string;
    publicKey: string;
}

export interface Choice {
    id?: number;
    questId: number;
    label: string;
    text: string;
    nextSceneId?: number;
}

export interface SceneChoice {
    id?: number;
    sceneId: number;
    choiceId: number;
}

export interface SceneText {
    id?: number;
    text: string;
    sceneId: number;
}

export interface Scene {
    id?: number;
    name: string;
    questId: number;
}

export interface Param {
    id?: number;
    label: string;
    questId: number;
    value: number;
    desc: string;
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
    scene_texts!: Dexie.Table<SceneText, number>;
    choices!: Dexie.Table<Choice, number>;
    scene_choice!: Dexie.Table<SceneChoice, number>;
    params!: Dexie.Table<Param, number>;

    constructor() {
        super('QuestsDB');
        this.version(1).stores({
            user: '++id',
            quests: '++id',
            choices: '++id, questId',
            scene_texts: '++id, sceneId',
            scene_choice: '++id, sceneId,choiceId',
            scenes: '++id, questId',
            params: '++id, questId'
        });
    }
}

export const db = new QuestsDB();
