'use client';
import React, {ReactNode} from "react";
import {PlayerProvider} from "@/app/components/sidebar/PlayerProvider";

export default function QuestLayout(
    {
        children,
    }: {
        children: ReactNode;
    }) {

    return <PlayerProvider>
            {children}
        </PlayerProvider>
}
