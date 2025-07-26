'use client';
import {Box, Divider, Grid, Typography} from "@mui/material";
import SceneList from "@/app/components/scene_list/SceneList";
import ParamsList from "@/app/components/params_list/ParamsList";
import {db} from "@/lib/db";
import {useLiveQuery} from "dexie-react-hooks";
import {useParams} from "next/navigation";
import FileLoader from "@/app/components/file_loader/FileLoader";
import React, {useEffect} from "react";
import AvailableChoiceList from "@/app/components/choice/AvailableChoiceList";
import SimpleParamForm from "@/app/components/params_list/SimpleParamForm";
import SimpleParamsList from "@/app/components/params_list/SimpleParamsList";
import {useSceneContext} from "@/app/components/scene_list/SceneProvider";


export default function QuestPage() {
    const {service} = useSceneContext();
    const {questId} = useParams();
    const questIdNum = Number(questId!);

    const {quest, scenes, choices} = useLiveQuery(async () => {
        const quest = await db.quests.get(questIdNum);
        const scenes = await db.scenes.where('questId').equals(questIdNum).toArray();
        const choices = await db.choices.where('questId').equals(questIdNum).toArray()

        return {quest, scenes, choices}
    }) ?? {quest: null, scenes: [], choices: []}

    if (!quest) {
        return <Typography>Quest not found :(</Typography>
    }

    return <Box mt={1}>
        <Typography>{quest?.name}</Typography>
        <Divider/>
        <Grid container spacing={1} mt={1}>
            <Grid size={6}>
                {scenes && <SceneList scenes={scenes}/>}
            </Grid>
            <Grid size={6}>
                <SimpleParamForm editedParam={service?.editedParam} questId={questIdNum}/>
                <SimpleParamsList questId={questIdNum}/>
                <FileLoader/>
                <AvailableChoiceList scenes={scenes} choices={choices}/>
            </Grid>
        </Grid>
    </Box>
}


