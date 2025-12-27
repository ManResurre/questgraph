import {Choice, db} from "@/lib/db";
import supabase from "@/supabaseClient";
import {cleanUndefined} from "@/lib/RepositoryHelper";

export async function setNextSceneId(choiceId: number, sceneId?: number) {
    const {error} = await supabase
        .from('choice')
        .update({nextSceneId: sceneId ?? null})
        .eq('id', choiceId);

    if (error) {
        console.error('Error updating nextSceneId:', error);
        throw error;
    }
}

export async function updateChoice(choice: Choice) {
    const {error} = await supabase
        .from('choice')
        .update(choice)
        .eq('id', Number(choice.id));

    if (error) {
        console.error('Error updating Choice:', error);
        throw error;
    }
}

export async function getChoice(id: number) {
    const {data, error} = await supabase.from('choice')
        .select("*")
        .eq('id', id)
        .single();

    if (error) throw error;

    return data;
}

// export function setNextSceneId(choiceId: number, sceneId?: number) {
//     db.choices.update(choiceId, {nextSceneId: sceneId})
// }

// export function getChoice(id: number) {
//     return db.choices.get(id);
// }

export function clearChoices(questId: number) {
    db.choices.where('questId').equals(questId).delete();
}

// export async function getScenesByChoice(choiceId: number) {
//     // 1. Получаем связи scene_choice для choiceId = 1
//     const sceneChoices = await db.scene_choice
//         .where('choiceId')
//         .equals(choiceId)
//         .toArray();
//
//     // 2. Если нет результатов - возвращаем пустой массив
//     if (!sceneChoices.length) return [];
//
//     // 3. Извлекаем IDs сцен
//     const sceneIds = sceneChoices.map(sc => sc.sceneId);
//
//     // 4. Получаем сцены по найденным IDs
//     return db.scenes
//         .where('id')
//         .anyOf(sceneIds)
//         .toArray();
// }

export async function saveChoice(choice: Choice) {
    const { error } = await supabase
        .from("choice")
        .upsert(cleanUndefined(choice));

    if (error) throw error;
}


// export async function saveChoice(data: Choice) {
//     db.choices.put(data);
// }

// export async function getChoices(questId: number) {
//     return db.choices.where('questId').equals(questId).toArray();
// }

// export function deleteChoice(choiceId: number) {
//     return db.choices.delete(choiceId);
// }
export async function deleteChoice(choiceId: number) {
    const {error} = await supabase
        .from("choice")
        .delete()
        .eq("id", choiceId);

    if (error) {
        throw error;
    }
}


export async function getChoices(questId: number) {
    const {data} = await supabase
        .from('choice')
        .select("*")
        .eq('quest_id', questId)
        .order("id", {ascending: true});

    return data;
}

export async function getChoicesByScene(sceneId: number) {
    // связи сцены с выборами
    const {data: sceneChoices, error: scErr} = await supabase
        .from("scene_choice")
        .select("choice_id")
        .eq("scene_id", sceneId);

    if (scErr) throw scErr;
    if (!sceneChoices?.length) return [];

    const choiceIds = sceneChoices.map(sc => sc.choice_id) as number[];

    // сами выборы
    const {data: choices, error: chErr} = await supabase
        .from("choice")
        .select("*")
        .in("id", choiceIds);

    if (chErr) throw chErr;

    return choices || [];
}

