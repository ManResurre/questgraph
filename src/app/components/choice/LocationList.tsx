import {Chip} from "@mui/material";
import React from "react";
import {useLiveQuery} from "dexie-react-hooks";
import {db, Scene} from "@/lib/db";

export interface LocationListParams {
    choiceId: number;
}

export default function LocationList({choiceId}: LocationListParams) {

    const scenesForChoice = useLiveQuery(async () => {
        // 1. Получаем связи scene_choice для choiceId = 1
        const sceneChoices = await db.scene_choice
            .where('choiceId')
            .equals(choiceId)
            .toArray();

        // 2. Если нет результатов - возвращаем пустой массив
        if (!sceneChoices.length) return [];

        // 3. Извлекаем IDs сцен
        const sceneIds = sceneChoices.map(sc => sc.sceneId);

        // 4. Получаем сцены по найденным IDs
        return db.scenes
            .where('id')
            .anyOf(sceneIds)
            .toArray();
    });


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