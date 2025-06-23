import {db, Scene} from "@/lib/db";
import {Button, Card, CardContent} from "@mui/material";
import React from "react";
import {useLiveQuery} from "dexie-react-hooks";

interface ChoiceListProps {
    scene: Scene
}

export default function ChoiceList({scene}: ChoiceListProps) {
    const choices = useLiveQuery(() => db.choices.where('sceneId').equals(scene?.id!).toArray());
    if (!choices) {
        return <></>;
    }
    return <Card>
        <CardContent>
            <ol>
                {choices.map((ch, index) => {
                    return <li key={`scene.${scene?.name}.choice.${index}`}>
                        <Button size="small" variant="text">{ch.label}</Button>
                    </li>
                })}
            </ol>
        </CardContent>
    </Card>
}
