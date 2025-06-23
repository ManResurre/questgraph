'use client'
import React from "react";
import {NextPage} from "next";

import {QuestList} from "@/app/components/quest_list/QuestList";
import {useLiveQuery} from "dexie-react-hooks";
import {db} from "@/lib/db";
import {Box, Grid} from "@mui/material";
import {QuestEditForm} from "@/app/components/quest_list/QuestEditForm";

const QuestsPage: NextPage = () => {
    const quests = useLiveQuery(() => db.quests.toArray());

    return <Grid container spacing={1} py={1}>
        <Grid size={6}>
            <QuestList quests={quests}/>
        </Grid>
        <Grid size={6}>
            <QuestEditForm/>
        </Grid>
    </Grid>
}

export default QuestsPage;
