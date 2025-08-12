import React from "react";
import {Choice} from "@/lib/db";
import {Button} from "@mui/material";
import {useSceneContext} from "@/app/components/scene_list/SceneProvider";

export interface ChoiceButtonProps {
    choice: Choice
}

export default function ChoiceButton({choice}: ChoiceButtonProps) {
    const {service} = useSceneContext();

    const handleClick = (sceneId: number | undefined) => {
        if (sceneId)
            service?.setExpandedScene(sceneId);
    }

    return <Button size="small" onClick={() => handleClick(choice?.nextSceneId)} variant="text">{choice.text}</Button>
}
