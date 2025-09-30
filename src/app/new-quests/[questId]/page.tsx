'use client'
import React, {ComponentType, useCallback, useEffect, useMemo, useState} from "react";
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
    Edge, FinalConnectionState, NodeChange, NodeTypes, NodeProps
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
import SearchNode from "@/app/components/rf/SearchNode";
import MiniDrawer from "@/app/components/sidebar/GraphMenuSidebar";

export type SceneNodeType = Node<SceneFullData>;
export type CustomEdgeType = Edge & { sourceHandle?: string; targetHandle?: string };

// Константы
const NODE_TYPES: NodeTypes = {
    sceneNode: SceneNode as ComponentType<NodeProps & {
        data: SceneFullData;
        type: string;
    }>,
    searchNode: SearchNode
};

const EDGE_TYPES = {
    buttonEdge: ButtonEdge,
    smart: SmartBezierEdge,
};

const CONNECTION_LINE_TYPE = ConnectionLineType.SmoothStep;
const CONTAINER_STYLE = {width: '100vw', height: 'calc(100vh - 64px)'};

const QuestPage = () => {
    const {questId} = useParams();
    const {screenToFlowPosition} = useReactFlow();

    const scenes = useLiveQuery(async () => getScenesWithChoices(Number(questId)));
    const {nodes: initialNodes, edges: initialEdges} = useMemo(() => {
        if (!scenes?.length) return {nodes: [], edges: []};

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

        const newNodes: SceneNodeType[] = scenes.map((scene, index) => ({
            id: scene.id.toString(),
            position: {x: 0, y: 0},
            data: {...scene.data, id: Number(scene.data.id)},
            type: 'sceneNode',
        } as SceneNodeType));

        return {nodes: newNodes, edges: newEdges};
    }, [scenes]);

    const [nodes, setNodes] = useState<SceneNodeType[]>(initialNodes);
    const [edges, setEdges] = useState<CustomEdgeType[]>(initialEdges);

    const {onLayout} = useLayoutedElements({nodes, edges, setNodes, setEdges});

    const onNodesChange = useCallback(
        (changes: NodeChange<SceneNodeType>[]) => {
            // if (changes.some(change => change.type === "position" && change.dragging)) {
            //     return
            // }
            setNodes(nodes => applyNodeChanges(changes, nodes))
        },
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

    const getEventCoordinates = useCallback((event: MouseEvent | TouchEvent) => {
        // Type guard для TouchEvent
        const isTouchEvent = (e: MouseEvent | TouchEvent): e is TouchEvent => {
            return 'touches' in e;
        };

        if (isTouchEvent(event) && event.touches.length > 0) {
            return {
                clientX: event.touches[0].clientX,
                clientY: event.touches[0].clientY
            };
        } else {
            // Теперь TypeScript знает, что это MouseEvent
            const mouseEvent = event as MouseEvent;
            return {
                clientX: mouseEvent.clientX,
                clientY: mouseEvent.clientY
            };
        }
    }, []);

    const onConnectEnd = useCallback((
        event: MouseEvent | TouchEvent, connectionState: FinalConnectionState
    ) => {
        const {clientX, clientY} = getEventCoordinates(event);

        const pos = screenToFlowPosition({x: clientX, y: clientY})
        const id = `search-node-${Date.now()}`;
        const searchNode = {
            id,
            type: 'searchNode',
            position: {x: pos.x, y: pos.y},
            data: {
                connectionState
            }
        } as SceneNodeType;

        setNodes((nodes) => nodes.concat(searchNode))
        setEdges((eds) =>
            eds.concat({id, source: connectionState.fromNode?.id, target: id} as CustomEdgeType),
        );
    }, [screenToFlowPosition])

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
                    connectionLineType={CONNECTION_LINE_TYPE}
                    colorMode="dark"
                    edgeTypes={EDGE_TYPES}
                    nodeTypes={NODE_TYPES}
                    fitView
                >
                    {/*<NodeMenu onLayout={onLayout}/>*/}
                    <Background/>
                    <Controls/>
                </ReactFlow>
                <GraphSidebar/>
                <MiniDrawer onLayout={onLayout}/>
            </div>
        </Grid>
    );
};

export default React.memo(QuestPage);
