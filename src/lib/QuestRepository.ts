import {db, Quest} from "@/lib/db";
import supabase from "@/supabaseClient";

export async function createQuest(quest: Quest) {
    await supabase
        .from("quests")
        .insert(quest);

    // await db.quests.put({
    //     ...quest,
    //     masterKey: "",
    //     authorKey: ""
    // })
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
