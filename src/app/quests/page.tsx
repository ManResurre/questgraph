'use client'
import {NextPage} from "next";

import {QuestList} from "@/app/components/quest_list/QuestList";
import {CircularProgress, Container} from "@mui/material";
import {QuestEditForm} from "@/app/components/quest_list/QuestEditForm";
import React from "react";
import {useCurrentUser} from "@/app/hooks/useCurrentUser";
import {User} from "@supabase/supabase-js";
import {useQuests} from "@/app/components/quest/QuestContext";

const QuestsPage: NextPage = () => {
    const {user} = useCurrentUser();

    const {isLoading} = useQuests();

    return <Container>
        <QuestEditForm user={user as User}/>
        {isLoading ?
            <CircularProgress size={24} color="inherit"/> :
            <QuestList user={user}/>}
    </Container>
}

export default QuestsPage;
