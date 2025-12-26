import {Choice, db, Scene, SceneText} from "@/lib/db";
import {FinalConnectionState} from "@xyflow/react";
import {parseLocations, parsePaths} from "@/lib/RepositoryHelper";
import supabase from "@/supabaseClient";
import {ISceneFormData} from "@/app/components/rf/SceneNodeEdit";

export interface SceneFullData extends Scene, Record<string, unknown> {
    choices?: Choice[];
    texts?: SceneText[];
    connectionState?: FinalConnectionState;
}

export async function updateChoices(sceneId: number, choices: Choice[]) {
    // удаляем все старые связи для этой сцены
    const {error: delErr} = await supabase
        .from("scene_choice")
        .delete()
        .eq("scene_id", sceneId);

    if (delErr) throw delErr;

    // готовим новые связи
    const sceneChoices = choices.map((choice) => ({
        choice_id: Number(choice.id!), // поле должно совпадать с названием в таблице
        scene_id: sceneId,
    }));

    // вставляем новые записи
    const {error: insErr} = await supabase
        .from("scene_choice")
        .insert(sceneChoices);

    if (insErr) throw insErr;
}

export async function getScenesWithChoices(questId: number) {
    const {data: scenes, error} = await supabase
        .from("scene")
        .select(`
      id,
      name,
      position,
      quest_id,
      scene_texts (
        id,
        text,
        scene_id
      ),
      scene_choice (
        id,
        choice:choice (
          id,
          label,
          text,
          "nextSceneId"
        )
      )
    `)
        .eq("quest_id", questId)
        .order("id", {ascending: true});

    if (error) throw error;
    if (!scenes?.length) return [];

    // Преобразуем результат в удобную структуру
    return scenes.map(scene => ({
        id: scene.id?.toString(),
        type: "sceneNode",
        dragHandle: ".drag-handle",
        position: scene.position ? JSON.parse(scene.position) : {x: 0, y: 0},
        data: {
            id: scene.id,
            name: scene.name,
            texts: scene.scene_texts || [],
            choices: (scene.scene_choice || []).map(sc => sc.choice),
        },
    }));
}

export default async function updateScene(scene: ISceneFormData) {
    // обновляем саму сцену
    const {error: sceneErr} = await supabase
        .from("scene")
        .update({
            name: scene.name,
            locPosition: scene.locPosition,
            samplyLink: scene.samplyLink,
        })
        .eq("id", scene.id!);

    if (sceneErr) throw sceneErr;

    // обновляем тексты сцены
    await updateSceneTexts(scene.id!, scene.texts as SceneText[]);

    // обновляем выборы
    await updateChoices(scene.id!, scene.choices as Choice[]);
}

export async function updateSceneTexts(sceneId: number, texts: SceneText[]) {
    // удаляем все старые тексты для этой сцены
    const {data, error: delErr} = await supabase
        .from("scene_texts")
        .delete()
        .eq("scene_id", sceneId);

    if (delErr) throw delErr;

    // готовим новые тексты
    const preparedTexts = texts.map(scene_text => ({
        text: scene_text.text,
        scene_id: sceneId, // поле в таблице
    }));

    // вставляем новые записи
    const {error: insErr} = await supabase
        .from("scene_texts")
        .insert(preparedTexts);

    if (insErr) throw insErr;
}

export async function createScene(scene: Scene) {
    console.log(scene);
    // return ;
    const {data, error} = await supabase
        .from("scene")
        .insert([scene]) // вставляем объект
        .select();       // возвращаем вставленную строку

    if (error) {
        console.error("Error creating scene:", error);
        throw error;
    }

    return data?.[0]; // возвращаем созданную сцену
}

// export async function createScene(scene: Scene) {
//     return db.scenes.add(scene);
// }

// export async function deleteScene(id: number) {
//     await db.transaction('rw',
//         db.scenes,
//         db.scene_texts,
//         db.scene_choice,
//         async () => {
//             await db.scene_texts.where('sceneId').equals(id).delete();
//             await db.scene_choice.where('sceneId').equals(id).delete();
//             await db.scenes.delete(id);
//         });
// }

export async function deleteScene(id: number) {
    const { error } = await supabase
        .from("scene")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting scene:", error);
        throw error;
    }
}

export async function createFromFile(
    fileContent: string,
    questId: number
) {
    const locations = parseLocations(fileContent); // Map<string, string[]>
    const paths = parsePaths(fileContent); // Map<string, string>

    // 1) Подготовим массив сцен для bulk insert
    const sceneNames = Array.from(locations.keys());
    const scenesToInsert = sceneNames.map((name) => ({
        name,
        quest_id: questId,
    }));

    // Вставляем все сцены сразу и получаем их id и name
    const {data: insertedScenes, error: scenesError} = await supabase
        .from("scene")
        .insert(scenesToInsert)
        .select();

    if (scenesError) throw scenesError;

    // 2) Сопоставляем name -> id (предполагаем, что name уникален в рамках quest)
    const nameToId = new Map<string, number>();
    for (const s of insertedScenes) {
        // s может быть any, но select("id, name") вернёт эти поля
        nameToId.set((s as any).name, (s as any).id);
    }

    // 3) Формируем массив scene_texts для bulk insert
    const sceneTextsToInsert = [];
    for (const [locName, texts] of locations.entries()) {
        const sceneId = nameToId.get(locName);
        if (!sceneId) {
            throw new Error(`No scene id found for scene name: ${locName}`);
        }
        for (const text of texts) {
            sceneTextsToInsert.push({
                text,
                scene_id: sceneId,
            });
        }
    }

    if (sceneTextsToInsert.length > 0) {
        const {error: textsError} = await supabase
            .from("scene_texts")
            .insert(sceneTextsToInsert);
        if (textsError) throw textsError;
    }

    // 4) Формируем и вставляем choices пакетно
    const choicesToInsert = [];
    for (const label of paths.keys()) {
        choicesToInsert.push({
            label,
            text: paths.get(label) ?? "",
            quest_id: questId,
        });
    }

    if (choicesToInsert.length > 0) {
        const {error: choicesError} = await supabase
            .from("choice")
            .insert(choicesToInsert);
        if (choicesError) throw choicesError;
    }
}


export interface UpdatePositionsProps {
    id: string;
    position: { x: number, y: number };
}

export async function updatePositions(questId: number, positions: UpdatePositionsProps[]) {
    try {
        // формируем массив для upsert
        const updates = positions.map(pos => ({
            id: parseInt(pos.id),
            quest_id: questId,
            position: JSON.stringify(pos.position),
            // locPosition: true // если нужно фиксировать
        }));

        const {data, error} = await supabase
            .from('scene')
            .upsert(updates, {onConflict: 'id'}); // обновление по PK

        if (error) {
            console.error('Error updating scene positions:', error);
            throw error;
        }

        const updatedCount = data?.length ?? 0;
        console.log(`Successfully updated ${updatedCount} scene positions`);

        return {success: true, updatedCount};
    } catch (error) {
        console.error('Error updating scene positions:', error);
        throw new Error(`Failed to update scene positions: ${error}`);
    }
}

export function clearScenes(questId: number) {
    db.scenes.where('questId').equals(questId).delete();
}

// export async function createFromFile(fileContent: string, questId: number) {
//     const locations = parseLocations(fileContent);
//     const paths = parsePaths(fileContent);
//
//     await db.transaction('rw',
//         db.scenes,
//         db.choices,
//         db.scene_texts,
//         async () => {
//
//             for (const loc of locations.keys()) {
//                 const sceneId = await db.scenes.put({name: loc, questId} as Scene);
//
//                 const texts = locations.get(loc).map((text: string) => {
//                     return {
//                         text,
//                         sceneId
//                     }
//                 })
//                 await db.scene_texts.bulkPut(texts as SceneText[]);
//             }
//             const pathsForDb: Choice[] = [];
//             for (const path of paths.keys()) {
//                 pathsForDb.push({label: path, text: paths.get(path), questId});
//             }
//             await db.choices.bulkPut(pathsForDb);
//         })
// }

// export async function getScenesWithChoices(questId: number) {
//     const scenes = await db.scenes.where('questId').equals(questId).toArray();
//
//     // Получаем все sceneId из полученных сцен
//     const sceneIds = scenes.map(scene => scene.id) as number[];
//
//     if (!sceneIds.length)
//         return [];
//
//     // Загружаем все связанные SceneText для этих sceneIds
//     const sceneTexts = await db.scene_texts.where('sceneId').anyOf(sceneIds).toArray();
//     // Группируем sceneTexts по sceneId для эффективного поиска
//     const textsBySceneId = new Map();
//     sceneTexts.forEach(text => {
//         if (!textsBySceneId.has(text.sceneId)) {
//             textsBySceneId.set(text.sceneId, []);
//         }
//         textsBySceneId.get(text.sceneId).push(text);
//     });
//
//
//     const sceneWithChoices = [];
//     for (let scene of scenes) {
//         sceneWithChoices.push({
//             id: scene.id?.toString(),
//             type: "sceneNode",
//             dragHandle: '.drag-handle',
//             position: scene.position ? JSON.parse(scene.position) : {x: 0, y: 0},
//             data: {
//                 ...scene,
//                 id: scene.id,
//                 name: scene.name,
//                 choices: await getChoices(scene.id!),
//                 texts: textsBySceneId.get(scene.id)
//             }
//         });
//     }
//
//     return sceneWithChoices;
// }

// export default async function updateScene(scene: SceneFullData) {
//     await db.transaction('rw',
//         db.scenes,
//         db.scene_texts,
//         db.scene_choice,
//         async () => {
//             db.scenes.update(Number(scene.id), {
//                 name: scene.name,
//                 locPosition: scene.locPosition,
//                 samplyLink: scene.samplyLink
//             });
//             updateSceneTexts(Number(scene.id), scene.texts as SceneText[])
//             updateChoices(Number(scene.id), scene.choices as Choice[]);
//         })
// }

// export async function updateSceneTexts(sceneId: number, texts: SceneText[]) {
//     db.scene_texts
//         .where('sceneId')
//         .equals(sceneId)
//         .delete();
//
//     const preparedTexts = texts.map(text => ({...text, sceneId}));
//     db.scene_texts.bulkPut(preparedTexts);
// }

// export async function updateChoices(sceneId: number, choices: Choice[]) {
//     await db.transaction('rw',
//         db.scene_choice,
//         async () => {
//             await db.scene_choice
//                 .where('sceneId')
//                 .equals(sceneId)
//                 .delete();
//
//             const sceneChoices: SceneChoice[] = choices.map((choice) => {
//                 return {choiceId: Number(choice.id!), sceneId}
//             });
//
//             await db.scene_choice.bulkPut(sceneChoices);
//         })
// }

// export async function getChoices(sceneId: number) {
//     const sceneChoices = await db.scene_choice
//         .where('sceneId')
//         .equals(sceneId)
//         .toArray();
//
//     if (!sceneChoices.length) return [];
//
//     const choiceIds = sceneChoices?.map(sc => sc.choiceId);
//
//     return db.choices
//         .where('id')
//         .anyOf(choiceIds!)
//         .toArray();
// }
