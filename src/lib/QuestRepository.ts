import supabase from "@/supabaseClient";
import {Database} from "@/supabase";

export type Quest = Database["public"]["Tables"]["quests"]["Row"];
export type QuestInsert = Database["public"]["Tables"]["quests"]["Insert"];

export async function upsertQuest(quest: Quest | QuestInsert) {
    const {error} = await supabase
        .from("quests")
        .upsert(quest as QuestInsert);

    if (error) {
        console.error('Error updating Quest:', error);
        throw error;
    }
}

export async function getQuests() {
    const {data, error} = await supabase.from("quests").select("*");
    if (error) throw new Error(error.message);
    return data;
}

export async function deleteQuest(id: number) {
    const {data, error} = await supabase.from("quests").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return data;
}
