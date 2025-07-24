import {Choice, ChoiceText, db, Scene} from "@/lib/db";
import {Button, Card, CardContent} from "@mui/material";
import React from "react";
import {useLiveQuery} from "dexie-react-hooks";
import ChoiceButton from "@/app/components/choice/ChoiceButton";

interface ChoiceListProps {
    scene: Scene
}

export default function ChoiceSceneList({scene}: ChoiceListProps) {

    const choicesForScene = useLiveQuery(async () => {
        const sceneChoices = await db.scene_choice
            .where('sceneId')
            .equals(scene?.id!)
            .toArray();

        if (!sceneChoices.length) return [];

        const choiceIds = sceneChoices?.map(sc => sc.choiceId);

        return db.choices
            .where('id')
            .anyOf(choiceIds!)
            .toArray()
    })

    if (!choicesForScene) {
        return <></>;
    }

    return <Card>
        <CardContent>
            <ol>
                {choicesForScene && choicesForScene.map((ch, index) => {
                    return <li key={`scene.${scene?.name}.choice.${index}`}>
                        <ChoiceButton choice={ch}/>
                    </li>
                })}
            </ol>
        </CardContent>
    </Card>
}
