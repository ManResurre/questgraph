import supabase from "@/supabaseClient";
import {Database} from "@/supabase";

type Parameter = Database["public"]["Tables"]["parameters"]["Row"];

export async function getParameters(questId: number) {
    const {data, error} = await supabase
        .from('parameters')
        .select("*")
        .eq('quest_id', questId)
        .order("id", {ascending: true});

    if (error) throw error;

    return data;
}

export async function updateParameters(parameter: Parameter) {
    const {error} = await supabase
        .from('parameters')
        .upsert(parameter);

    if (error) {
        console.error('Error updating Choice:', error);
        throw error;
    }
}

export async function deleteParameter(parameterId: number) {
    const {error} = await supabase
        .from("parameters")
        .delete()
        .eq("id", parameterId);

    if (error) {
        throw error;
    }
}
