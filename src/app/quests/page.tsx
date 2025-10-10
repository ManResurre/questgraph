'use client'
import {NextPage} from "next";

import {QuestList} from "@/app/components/quest_list/QuestList";
import {db} from "@/lib/db";
import {useLiveQuery} from "dexie-react-hooks";
import {Container} from "@mui/material";
import {QuestEditForm} from "@/app/components/quest_list/QuestEditForm";

const QuestsPage: NextPage = () => {
    const quests = useLiveQuery(() => db.quests.toArray());

    return <Container>
        <QuestEditForm/>
        <QuestList quests={quests}/>
    </Container>
}

export default QuestsPage;
