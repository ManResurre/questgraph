import {Choice, db, Scene, SceneChoice, SceneText} from "@/lib/db";

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

    const sceneWithChoices = [];
    for (let scene of scenes) {
        sceneWithChoices.push({
            id: String(scene.id),
            type: "sceneNode",
            position: {x: 0, y: 0},
            data: {
                id: String(scene.id),
                label: scene.name,
                choices: await getChoices(scene.id!)
            }
        });
    }

    return sceneWithChoices;
}