'use client'
import React, {useEffect, useMemo, useState} from "react";
import {
    ReactFlow,
    Background,
    Controls,
} from "@xyflow/react";

import {useParams} from "next/navigation";
import useLayoutElements from "@/app/quests/[questId]/dagreLayout";

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
    CustomEdgeType, EDGE_TYPES, NODE_TYPES,
    SceneNodeType
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

    const [nodes, setNodes] = useState<SceneNodeType[]>(initialNodes);
    const [edges, setEdges] = useState<CustomEdgeType[]>(initialEdges);

    const {onLayout} = useLayoutElements({nodes, edges, setNodes, setEdges, questId: Number(questId)});

    const {
        onNodesChange,
        onEdgesChange,
        onConnect,
        onConnectEnd,
        onDrop,
        onDragStart,
        onDragOver,
        handleEdgeClick
    } = useQuestGraph(Number(questId), nodes, setNodes, setEdges, typeDraggable);

    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges]);

    const memoizedNodes = useMemo(() => nodes, [nodes]);

    return (
        <Grid container spacing={1}>
            <div style={CONTAINER_STYLE}>
                <ReactFlow
                    nodes={memoizedNodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    selectNodesOnDrag={true}
                    elevateNodesOnSelect={true}
                    nodesDraggable={true}
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
                    fitView
                >
                    <Background/>
                    <Controls/>
                </ReactFlow>
                <GraphSidebar/>
                <GraphMenuSidebar onLayout={onLayout}/>
                <PlayerModal/>
            </div>
        </Grid>
    );
};

export default React.memo(QuestPage);
