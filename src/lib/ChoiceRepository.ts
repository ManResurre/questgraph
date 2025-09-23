import {db} from "@/lib/db";

export function setNextSceneId(choiceId: number, sceneId?: number) {
    db.choices.update(choiceId, {nextSceneId: sceneId})
}