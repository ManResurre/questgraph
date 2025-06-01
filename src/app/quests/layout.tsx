'use client';
import {ReactNode} from "react";
import QuestsProvider from "@/app/components/quest_list/QuestsProvider";
import SceneProvider from "@/app/components/scene_list/SceneProvider";
import {Container} from "@mui/material";

export default function QuestsLayout(
    {
        children,
    }: {
        children: ReactNode;
    }) {

    return <Container>
        <QuestsProvider>
            <SceneProvider>
                {children}
            </SceneProvider>
        </QuestsProvider>
    </Container>;
}
