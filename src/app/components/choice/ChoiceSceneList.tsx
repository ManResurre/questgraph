import {Card, CardContent} from "@mui/material";
import React from "react";
import {useLiveQuery} from "dexie-react-hooks";
import ChoiceButton from "@/app/components/choice/ChoiceButton";
import {getChoices} from "@/lib/SceneRepository";

interface ChoiceListProps {
    sceneId: number
}

export default function ChoiceSceneList({sceneId}: ChoiceListProps) {

    const choicesForScene = useLiveQuery(() =>
            getChoices(sceneId),
        [sceneId])

    if (!choicesForScene) {
        return <></>;
    }

    return <Card>
        <CardContent>
            <ol>
                {choicesForScene && choicesForScene.map((ch, index) => {
                    return <li key={`scene.choice.${index}`}>
                        <ChoiceButton choice={ch}/>
                    </li>
                })}
            </ol>
        </CardContent>
    </Card>
}
