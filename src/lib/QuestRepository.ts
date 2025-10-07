import {db, Quest} from "@/lib/db";

export async function createQuest(quest: Quest) {
    await db.quests.put({
        ...quest,
        masterKey: "",
        authorKey: ""
    })
}
