import {db} from "@/lib/db";

export function setNextSceneId(choiceId: number, sceneId?: number) {
    db.choices.update(choiceId, {nextSceneId: sceneId})
}

export function getChoice(id: number) {
    return db.choices.get(id);
}

export function clearChoices(questId: number) {
    db.choices.where('questId').equals(questId).delete();
}
