import {Choice, db, Scene, SceneChoice, SceneText} from "@/lib/db";
import {FinalConnectionState} from "@xyflow/react";
import {parseLocations, parsePaths} from "@/lib/RepositoryHelper";

export interface SceneFullData extends Scene, Record<string, unknown> {
    choices?: Choice[];
    texts?: SceneText[];
    connectionState?: FinalConnectionState;
}

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
            id: scene.id,
            type: "sceneNode",
            position: scene.position ? JSON.parse(scene.position) : {x: 0, y: 0},
            data: {
                ...scene,
                id: scene.id,
                name: scene.name,
                choices: await getChoices(scene.id!),
                texts: textsBySceneId.get(scene.id)
            }
        });
    }

    return sceneWithChoices;
}

export default async function updateScene(scene: SceneFullData) {
    await db.transaction('rw',
        db.scenes,
        db.scene_texts,
        db.scene_choice,
        async () => {
            db.scenes.update(Number(scene.id), {
                name: scene.name,
                locPosition: scene.locPosition,
                samplyLink: scene.samplyLink
            });
            updateSceneTexts(Number(scene.id), scene.texts as SceneText[])
            updateChoices(Number(scene.id), scene.choices as Choice[]);
        })
}

export async function updateSceneTexts(sceneId: number, texts: SceneText[]) {
    const preparedTexts = texts.map(text => ({...text, sceneId}));
    db.scene_texts.bulkPut(preparedTexts);
}

export async function createScene(scene: Scene) {
    return db.scenes.add(scene);
}

export async function deleteScene(id: number) {
    await db.transaction('rw',
        db.scenes,
        db.scene_texts,
        db.scene_choice,
        async () => {
            await db.scene_texts.where('sceneId').equals(id).delete();
            await db.scene_choice.where('sceneId').equals(id).delete();
            await db.scenes.delete(id);
        });
}

export async function createFromFile(fileContent: string, questId: number) {
    const locations = parseLocations(fileContent);
    const paths = parsePaths(fileContent);

    await db.transaction('rw',
        db.scenes,
        db.choices,
        db.scene_texts,
        async () => {

            for (const loc of locations.keys()) {
                const sceneId = await db.scenes.put({name: loc, questId} as Scene);

                const texts = locations.get(loc).map((text: string) => {
                    return {
                        text,
                        sceneId
                    }
                })
                await db.scene_texts.bulkPut(texts as SceneText[]);
            }
            const pathsForDb: Choice[] = [];
            for (const path of paths.keys()) {
                pathsForDb.push({label: path, text: paths.get(path), questId});
            }
            await db.choices.bulkPut(pathsForDb);
        })
}

export interface UpdatePositionsProps {
    id: string;
    position: { x: number, y: number };
}

export async function updatePositions(positions: UpdatePositionsProps[]) {
    try {
        // Обновляем только позиции без создания полных объектов Scene
        const updatePromises = positions.map(pos =>
            db.scenes.update(parseInt(pos.id), {
                position: JSON.stringify(pos.position),
                // locPosition: true
            })
        );

        const results = await Promise.all(updatePromises);
        const successfulUpdates = results.filter(result => result > 0).length;

        console.log(`Successfully updated ${successfulUpdates} scene positions`);
        return {success: true, updatedCount: successfulUpdates};
    } catch (error) {
        console.error('Error updating scene positions:', error);
        throw new Error(`Failed to update scene positions: ${error}`);
    }
}

export function clearScenes(questId: number) {
    db.scenes.where('questId').equals(questId).delete();
}
