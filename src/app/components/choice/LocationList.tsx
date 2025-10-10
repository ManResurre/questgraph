import {Chip} from "@mui/material";
import React from "react";
import {useLiveQuery} from "dexie-react-hooks";
import {db, Scene} from "@/lib/db";
import {getScenesByChoice} from "@/lib/ChoiceRepository";

export interface LocationListParams {
    choiceId: number;
}

export default function LocationList({choiceId}: LocationListParams) {

    const scenesForChoice = useLiveQuery(async () => getScenesByChoice(choiceId));


    const handleDeleteLink = async (scene: Scene) => {
        db.scene_choice
            .where('sceneId')
            .equals(scene?.id!)
            .and(sc => sc.choiceId === choiceId)
            .delete();
    }

    if (!scenesForChoice)
        return;

    return scenesForChoice.map((scene) =>
        <Chip key={scene.id} label={scene.name}
              onDelete={() => handleDeleteLink(scene)}/>
    )
}
