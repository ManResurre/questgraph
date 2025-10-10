import {Choice, db} from "@/lib/db";

export function setNextSceneId(choiceId: number, sceneId?: number) {
    db.choices.update(choiceId, {nextSceneId: sceneId})
}

export function getChoice(id: number) {
    return db.choices.get(id);
}

export function clearChoices(questId: number) {
    db.choices.where('questId').equals(questId).delete();
}

export async function getScenesByChoice(choiceId: number) {
    // 1. Получаем связи scene_choice для choiceId = 1
    const sceneChoices = await db.scene_choice
        .where('choiceId')
        .equals(choiceId)
        .toArray();

    // 2. Если нет результатов - возвращаем пустой массив
    if (!sceneChoices.length) return [];

    // 3. Извлекаем IDs сцен
    const sceneIds = sceneChoices.map(sc => sc.sceneId);

    // 4. Получаем сцены по найденным IDs
    return db.scenes
        .where('id')
        .anyOf(sceneIds)
        .toArray();
}

export async function saveChoice(data: Choice) {
    db.choices.put(data);
}

export async function getChoices(questId: number) {
    return db.choices.where('questId').equals(questId).toArray();
}

export function deleteChoice(choiceId: number) {
    return db.choices.delete(choiceId);
}
