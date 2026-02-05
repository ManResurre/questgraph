'use client'
import React, {useEffect, useMemo} from "react";
import {
    ReactFlow,
    Background,
    Controls, useReactFlow,
} from "@xyflow/react";

import {useParams} from "next/navigation";

import '@xyflow/react/dist/style.css';
import {useSidebar} from "@/app/components/sidebar/graphSidebarProvider";
import {useScenesWithChoices} from "@/app/hooks/scene";
import {Grid} from "@mui/material";
import GraphSidebar from "@/app/components/sidebar/GraphSidebar";
import PlayerModal from "@/app/components/quest_player/PlayerModal";
import GraphMenuSidebar from "@/app/components/sidebar/GraphMenuSidebar";
import {useQuestGraph} from "@/app/quests/[questId]/hooks/graph";
import {
    CONNECTION_LINE_TYPE,
    CONTAINER_STYLE,
    EDGE_TYPES, NODE_TYPES,
} from "@/app/quests/[questId]/constants/graph";
import {buildGraphFromScenes} from "@/app/quests/[questId]/utils/graphUtils";

const QuestPage = () => {
    const {questId} = useParams();
    const {typeDraggable} = useSidebar();

    const {data: scenes} = useScenesWithChoices(Number(questId));

    const {nodes: initialNodes, edges: initialEdges} = useMemo(
        () => buildGraphFromScenes(scenes ?? []),
        [scenes]
    );

    const {setNodes, setEdges} = useReactFlow();
    const {
        onNodesChange,
        onEdgesChange,
        onConnect,
        onConnectEnd,
        onDrop,
        onDragStart,
        onDragOver,
        handleEdgeClick
    } = useQuestGraph(Number(questId), setNodes, setEdges, typeDraggable);

    useEffect(() => {
        if (initialNodes.length) {
            setNodes(initialNodes);
            setEdges(initialEdges);
        }
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    return (
        <Grid container spacing={1}>
            <div style={CONTAINER_STYLE}>
                <ReactFlow
                    defaultNodes={initialNodes}
                    defaultEdges={initialEdges}
                    selectNodesOnDrag={true}
                    elevateNodesOnSelect={true}
                    nodesDraggable={true}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onConnectEnd={onConnectEnd}
                    onDrop={onDrop}
                    onDragStart={onDragStart}
                    onDragOver={onDragOver}
                    onEdgeClick={handleEdgeClick}
                    connectionLineType={CONNECTION_LINE_TYPE}
                    colorMode="dark"
                    edgeTypes={EDGE_TYPES}
                    nodeTypes={NODE_TYPES}
                    proOptions={{hideAttribution: true}}
                >
                    <Background/>
                    <Controls/>
                </ReactFlow>
                <GraphSidebar/>
                <GraphMenuSidebar />
                <PlayerModal/>
            </div>
        </Grid>
    );
};

export default React.memo(QuestPage);
