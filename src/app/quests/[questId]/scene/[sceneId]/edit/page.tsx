'use client';
import React from "react";
import SceneForm from "@/app/components/scene_list/SceneForm";
import {Box} from "@mui/material";
import {useLiveQuery} from "dexie-react-hooks";
import {db} from "@/lib/db";
import {useParams} from "next/navigation";

export default function EditScenePage() {
    const {sceneId} = useParams();

    const scene = useLiveQuery(() => db.scenes.get(Number(sceneId)));
    const choices = useLiveQuery(() => db.choices.where('sceneId').equals(Number(sceneId)).toArray());

    return <Box mt={1}>
        {scene && choices && <SceneForm scene={{
            ...scene,
            choices
        }}/>}
    </Box>
}
