'use client';
import {ReactNode} from "react";
import SceneProvider from "@/app/components/scene_list/SceneProvider";

export default function SceneLayout(
    {
        children,
    }: {
        children: ReactNode;
    }) {
    return <SceneProvider>
        {children}
    </SceneProvider>
}
