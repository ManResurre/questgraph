'use client'
import {NextPage} from "next";

import {QuestList} from "@/app/components/quest_list/QuestList";
import {db} from "@/lib/db";
import {useLiveQuery} from "dexie-react-hooks";

const TestPage: NextPage = () => {
    const quests = useLiveQuery(() => db.quests.toArray());


    return <QuestList quests={quests}/>
}

export default TestPage;
