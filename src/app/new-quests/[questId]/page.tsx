'use client'
import {useSidebar} from "@/app/components/sidebar/graphSidebarProvider";
import React, {useCallback, useEffect, useState} from "react";
import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    Connection,
    ConnectionLineType,
    Controls,
    ReactFlow,
    useReactFlow,
    Node,
    Edge
} from "@xyflow/react";
import {useLiveQuery} from "dexie-react-hooks";
import {getScenesWithChoices, SceneFullData} from "@/lib/SceneRepository";
import {Grid} from "@mui/material";
import NodeMenu from "@/app/components/rf/NodeMenu";
import GraphSidebar from "@/app/components/sidebar/GraphSidebar";
import SceneNode from "@/app/components/rf/SceneNode";
import ButtonEdge from "@/app/components/rf/ButtonEdge";
import {useParams} from "next/navigation";
import {setNextSceneId} from "@/lib/ChoiceRepository";
import useLayoutedElements from "@/app/new-quests/[questId]/helper";

import '@xyflow/react/dist/style.css';
import {SmartBezierEdge} from "@tisoap/react-flow-smart-edge";

export type SceneNodeType = Node<SceneFullData>;
export type CustomEdgeType = Edge & { sourceHandle?: string; targetHandle?: string };

// Константы
const NODE_TYPES = {
    sceneNode: SceneNode,
};

const EDGE_TYPES = {
    buttonEdge: ButtonEdge,
    smart: SmartBezierEdge,
};

const CONNECTION_LINE_TYPE = ConnectionLineType.SmoothStep;
const CONTAINER_STYLE = {width: '100vw', height: 'calc(100vh - 100px)'};

export default function QuestPage() {
    const {questId} = useParams();
    const {setCenter} = useReactFlow();

    const [nodes, setNodes] = useState<SceneNodeType[]>([]);
    const [edges, setEdges] = useState<CustomEdgeType[]>([]);

    const scenes = useLiveQuery(async () => getScenesWithChoices(Number(questId)));
    const {onLayout} = useLayoutedElements({nodes, edges, setNodes, setEdges});

    const onNodesChange = useCallback(
        (changes: any) => setNodes(nodes => applyNodeChanges(changes, nodes)),
        []
    );

    const onEdgesChange = useCallback(
        (changes: any) => setEdges(edges => applyEdgeChanges(changes, edges)),
        []
    );

    const onConnect = useCallback(
        (connection: Connection) => {
            if (connection.sourceHandle && connection.targetHandle) {
                const choiceId = parseInt(connection.sourceHandle.substring(1));
                const sceneId = parseInt(connection.targetHandle.substring(1));

                if (choiceId && sceneId) {
                    setNextSceneId(choiceId, sceneId);
                }
            }

            setEdges(edges => addEdge({...connection, type: 'buttonEdge'}, edges));
        },
        []
    );

    useEffect(() => {
        if (!scenes?.length) return;

        // console.log('changed', scenes);

        // Создание edges
        const newEdges = scenes.flatMap(scene =>
            scene.data.choices
                .filter(choice => choice.nextSceneId)
                .map(choice => ({
                    id: `edge_${scene.id}_c${choice.id}_ns${choice.nextSceneId}`,
                    source: `${scene.id}`,
                    sourceHandle: `c${choice.id}_s${choice.nextSceneId}`,
                    target: `${choice.nextSceneId}`,
                    targetHandle: `s${choice.nextSceneId}`,
                    type: 'buttonEdge' as const,
                }))
        );

        // Создание nodes
        const newNodes: SceneNodeType[] = scenes.map((scene) => ({
            id: scene.id.toString(),
            position: {x: 0, y: 0},
            data: {...scene.data, id: Number(scene.data.id)},
            type: 'sceneNode',
        } as SceneNodeType));

        setNodes(newNodes);
        setEdges(newEdges);

        const firstNode = newNodes[0];
        setCenter(firstNode.position.x, firstNode.position.y, {
            zoom: 0.7,
            duration: 1000
        });


    }, [scenes]);

    return (
        <Grid container spacing={1} py={1}>
            <div style={CONTAINER_STYLE}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    connectionLineType={CONNECTION_LINE_TYPE}
                    colorMode="dark"
                    edgeTypes={EDGE_TYPES}
                    nodeTypes={NODE_TYPES}
                    fitView
                >
                    <NodeMenu onLayout={onLayout}/>
                    <Background/>
                    <Controls/>
                </ReactFlow>
                <GraphSidebar/>
            </div>
        </Grid>
    );
}