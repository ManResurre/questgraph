export interface Choice {
    text: string;
    nextSceneId: string;
}

export interface Scene {
    text: string;
    choices: Choice[];
}
