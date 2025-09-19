'use client';
import React from "react";
import SceneForm from "@/app/components/scene_list/SceneForm";
import {Box} from "@mui/material";
import {useLiveQuery} from "dexie-react-hooks";
import {Choice, db, SceneText} from "@/lib/db";
import {useParams} from "next/navigation";
import {getChoices} from "@/lib/SceneRepository";

export default function EditScenePage() {
    const {sceneId} = useParams();

    const scene = useLiveQuery(async () => {
        const scene = await db.scenes.get(Number(sceneId));
        const sceneTexts = await db.scene_texts
            .where('sceneId')
            .equals(Number(sceneId))
            .toArray();

        const choices = await getChoices(Number(sceneId));
        console.log(choices);
        return {...scene, texts: sceneTexts, choices};
    });
    const choices: Choice[] = []
    return <Box mt={1}>
        {scene && choices && <SceneForm scene={{
            ...scene,
            choices
        }}/>}
    </Box>
}
