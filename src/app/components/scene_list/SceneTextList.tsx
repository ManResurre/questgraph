import React from "react";
import {List, ListItem} from "@mui/material";
import {db, Scene} from "@/lib/db";
import {useLiveQuery} from "dexie-react-hooks";

interface SceneTextListProps {
    scene?: Scene
}

export default function SceneTextList({scene}: SceneTextListProps) {
    const texts = useLiveQuery(() => db.scene_texts.where('sceneId').equals(scene?.id!).toArray());


    return <List>
        {texts && texts.map((item) =>
            <ListItem key={item.id}>{item.text}</ListItem>
        )}
    </List>
}