import {Choice, db, Scene, SceneChoice, SceneText} from "@/lib/db";
import {unknown} from "zod";

export async function getChoices(sceneId: number) {
    const sceneChoices = await db.scene_choice
        .where('sceneId')
        .equals(sceneId)
        .toArray();

    if (!sceneChoices.length) return [];

    const choiceIds = sceneChoices?.map(sc => sc.choiceId);

    return db.choices
        .where('id')
        .anyOf(choiceIds!)
        .toArray();
}

export async function updateChoices(sceneId: number, choices: Choice[]) {
    await db.transaction('rw',
        db.scene_choice,
        async () => {
            await db.scene_choice
                .where('sceneId')
                .equals(sceneId)
                .delete();

            const sceneChoices: SceneChoice[] = choices.map((choice) => {
                return {choiceId: Number(choice.id!), sceneId}
            });

            await db.scene_choice.bulkPut(sceneChoices);
        })
}

export async function getScenesWithChoices(questId: number) {
    const scenes = await db.scenes.where('questId').equals(questId).toArray();

    // Получаем все sceneId из полученных сцен
    const sceneIds = scenes.map(scene => scene.id) as number[];

    if (!sceneIds.length)
        return [];

    // Загружаем все связанные SceneText для этих sceneIds
    const sceneTexts = await db.scene_texts.where('sceneId').anyOf(sceneIds).toArray();
    // Группируем sceneTexts по sceneId для эффективного поиска
    const textsBySceneId = new Map();
    sceneTexts.forEach(text => {
        if (!textsBySceneId.has(text.sceneId)) {
            textsBySceneId.set(text.sceneId, []);
        }
        textsBySceneId.get(text.sceneId).push(text);
    });


    const sceneWithChoices = [];
    for (let scene of scenes) {
        sceneWithChoices.push({
            id: String(scene.id),
            type: "sceneNode",
            position: {x: 0, y: 0},
            data: {
                id: String(scene.id),
                name: scene.name,
                choices: await getChoices(scene.id!),
                texts: textsBySceneId.get(scene.id)
            }
        });
    }

    return sceneWithChoices;
}

export interface SceneFullData extends Scene, Record<string, unknown> {
    choices?: Choice[];
    texts?: SceneText[];
}

export default async function updateScene(scene: SceneFullData) {
    await db.transaction('rw',
        db.scenes,
        db.scene_texts,
        db.scene_choice,
        async () => {
            db.scenes.update(Number(scene.id), {name: scene.name});
            updateSceneTexts(Number(scene.id), scene.texts)
            updateChoices(Number(scene.id), scene.choices);
        })
}

export async function updateSceneTexts(sceneId: number, texts: SceneText[]) {
    const preparedTexts = texts.map(text => ({...text, sceneId}));
    db.scene_texts.bulkPut(preparedTexts);
}