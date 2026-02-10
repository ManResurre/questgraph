import supabase from "@/supabaseClient";
import {Database} from "@/supabase";

export type ParameterType = Database["public"]["Enums"]["ParameterType"];
export type Parameter = Database["public"]["Tables"]["parameters"]["Row"];
export type ParameterInsert =
    Database["public"]["Tables"]["parameters"]["Insert"];
export type ParameterScene =
    Database["public"]["Tables"]["parameter_scene"]["Row"];
export type ParameterSceneInsert =
    Database["public"]["Tables"]["parameter_scene"]["Insert"];
export type ParameterChoice =
    Database["public"]["Tables"]["parameter_choice"]["Row"];

export async function deleteParameterChoice(id: number) {
    const {data, error} = await supabase
        .from("parameter_choice")
        .delete()
        .eq("id", id);

    if (error) {
        throw error;
    }

    return data;
}

export async function getChoiceParameters(
    choice_id: number,
): Promise<ParameterChoice[]> {
    const {data, error} = await supabase
        .from("parameter_choice")
        .select("*")
        .eq("choice_id", choice_id)
        .order("id", {ascending: true});

    if (error) throw error;

    return data;
}

export async function upsertParameterChoice(pc: ParameterChoice) {
    const {error} = await supabase.from("parameter_choice").upsert(pc);

    if (error) {
        console.error("Error updating Parameter Choice:", error);
        throw error;
    }
}

export async function getParameters(questId: number) {
    const {data, error} = await supabase
        .from("parameters")
        .select("*")
        .eq("quest_id", questId)
        .order("id", {ascending: true});

    if (error) throw error;

    return data;
}

export async function upsertParameter(parameter: Parameter | ParameterInsert) {
    const {error} = await supabase.from("parameters").upsert(parameter);

    if (error) {
        console.error("Error updating Parameter:", error);
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
        .from("parameter_scene")
        .select("*")
        .eq("scene_id", sceneId)
        .order("id", {ascending: true});

    if (error) throw error;

    return data;
}

export async function upsertSceneParameter(
    value: ParameterScene | ParameterSceneInsert,
) {
    console.log("upsertSceneParameter");
    const {error} = await supabase.from("parameter_scene").upsert(value);

    if (error) {
        console.error("Error updating Parameter Scene:", error);
        throw error;
    }
}

export async function getParametersChoice(choiceId: number) {
    const {data, error} = await supabase
        .from("parameter_choice")
        .select("*")
        .eq("choice_id", choiceId)
        .order("id", {ascending: true});

    if (error) throw error;

    return data;
}
