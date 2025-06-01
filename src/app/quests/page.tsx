import React from "react";
import {NextPage} from "next";

import {QuestList} from "@/app/components/quest_list/QuestList";
import {DatabaseService} from "@/lib/DatabaseService";
import {Quest} from "@/entity";

const QuestsPage: NextPage = async () => {
    await DatabaseService.getInstance();
    const quests: any = await Quest.find();
    return <QuestList quests={JSON.parse(JSON.stringify(quests))}/>
}

export default QuestsPage;
