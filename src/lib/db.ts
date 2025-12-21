import Dexie from 'dexie';

export interface User {
    id: string;
    name?: string;
    privateKey: string;
    publicKey: string;
}

export interface Game {
    id?: number;
    questId: number;
    userId: string;
    sceneId: number;
}

export interface Status {
    id?: number;
    gameId: number;
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

export interface SceneParam {
    id?: number;
    sceneId: number;
    paramId: number;
    value: string;
    hide: boolean;
}

export interface ChoiceParam {
    id?: number;
    choiceId: number;
    paramId: number;
    value: string;
}

export interface Scene {
    id?: number;
    name: string;
    questId: number;
    position?: string;
    locPosition?: boolean;
    samplyLink?: string;
}

export interface Param {
    id?: number;
    questId: number;
    key: string;
    label: string;
    value: string;
    desc?: string;
    hide: boolean;
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
    scene_param!: Dexie.Table<SceneParam, number>;
    choice_param!: Dexie.Table<ChoiceParam, number>;
    choices!: Dexie.Table<Choice, number>;
    scene_choice!: Dexie.Table<SceneChoice, number>;
    params!: Dexie.Table<Param, number>;
    game!: Dexie.Table<Game, number>;

    constructor() {
        super('QuestsDB');
        this.version(1).stores({
            user: 'id',
            quests: '++id',
            choices: '++id, questId',
            scene_texts: '++id, sceneId',
            scene_param: '++id, sceneId, paramId',
            choice_param: '++id, choiceId, paramId',
            scene_choice: '++id, sceneId,choiceId',
            scenes: '++id, questId',
            params: '++id, questId',
            game: '++id'
        });
    }
}

export const db = new QuestsDB();
