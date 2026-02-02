import supabase from "@/supabaseClient";
import {Database} from "@/supabase";

export async function deleteParameterChoice(selectedId: number) {
}

export async function getParameterChoice(id: number) {
}

export async function updateParameterChoice(p0: {
    choice_id: number | null;
    id: number;
    param_id: number | null;
    value: string | null;
}) {
}


export type Parameter = Database["public"]["Tables"]["parameters"]["Row"];
export type ParameterInsert = Database["public"]["Tables"]["parameters"]["Insert"];
export type ParameterScene = Database["public"]["Tables"]["parameter_scene"]["Row"];
export type ParameterSceneInsert = Database["public"]["Tables"]["parameter_scene"]["Insert"];

export async function getParameters(questId: number) {
    const {data, error} = await supabase
        .from('parameters')
        .select("*")
        .eq('quest_id', questId)
        .order("id", {ascending: true});

    if (error) throw error;

    return data;
}

export async function upsertParameter(parameter: Parameter | ParameterInsert) {
    const {error} = await supabase
        .from('parameters')
        .upsert(parameter);

    if (error) {
        console.error('Error updating Parameter:', error);
        throw error;
    }
}

export async function deleteParameter(parameterId: number) {
    const {data, error} = await supabase
        .from("parameters")
        .delete()
        .eq("id", parameterId);

    if (error) {
        throw error;
    }

    return data;
}

export async function getSceneParameters(sceneId: number) {
    const {data, error} = await supabase
        .from('parameter_scene')
        .select("*")
        .eq('scene_id', sceneId)
        .order("id", {ascending: true});

    if (error) throw error;

    return data;
}

export async function upsertSceneParameter(value: ParameterScene | ParameterSceneInsert) {
    console.log('upsertSceneParameter');
    const {error} = await supabase
        .from('parameter_scene')
        .upsert(value);

    if (error) {
        console.error('Error updating Parameter Scene:', error);
        throw error;
    }
}

export async function getParametersChoice(choiceId: number) {
    const {data, error} = await supabase
        .from('parameter_choice')
        .select("*")
        .eq('choice_id', choiceId)
        .order("id", {ascending: true});

    if (error) throw error;

    return data;
}
