'use client';
import React, {ReactNode} from "react";
import {ReactFlowProvider} from "@xyflow/react";
import {GraphSidebarProvider} from "@/app/components/sidebar/graphSidebarProvider";
import '../globals.css';

export default function QuestsLayout(
    {
        children,
    }: {
        children: ReactNode;
    }) {

    return <ReactFlowProvider>
        <GraphSidebarProvider>
            {children}
        </GraphSidebarProvider>
    </ReactFlowProvider>;
}
