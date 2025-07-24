import {Choice, db, Scene} from "@/lib/db";
import {Button, Card, CardContent} from "@mui/material";
import React from "react";
import {useLiveQuery} from "dexie-react-hooks";
import ChoiceButton from "@/app/components/choice/ChoiceButton";
import {getChoices} from "@/app/components/choice/Helper";

interface ChoiceListProps {
    scene: Scene
}

export default function ChoiceSceneList({scene}: ChoiceListProps) {

    const choicesForScene = useLiveQuery(async () => {
        return getChoices(Number(scene.id))
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
