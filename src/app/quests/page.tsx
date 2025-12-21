'use client'
import {NextPage} from "next";

import {QuestList} from "@/app/components/quest_list/QuestList";
import {CircularProgress, Container} from "@mui/material";
import {QuestEditForm} from "@/app/components/quest_list/QuestEditForm";
import {getQuests} from "@/lib/QuestRepository";
import {useQuery} from "@tanstack/react-query";
import React from "react";

const QuestsPage: NextPage = () => {
    const {data: quests, isLoading, refetch} = useQuery({
        queryKey: ["quests"],
        queryFn: getQuests,
        staleTime: 1000 * 60 * 5,   // 5 минут данные считаются свежими
        gcTime: 1000 * 60 * 30,  // 30 минут хранятся в кэше
        refetchOnWindowFocus: false,
    });

    return <Container>
        <QuestEditForm refetch={refetch}/>
        {isLoading ? <CircularProgress size={24} color="inherit"/> : <QuestList refetch={refetch} quests={quests}/>}
    </Container>
}

export default QuestsPage;
