import {db} from "@/lib/db";

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
