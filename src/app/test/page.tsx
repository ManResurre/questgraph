'use client'
import '../globals.css';
import React, {useCallback, useEffect, useRef, useState} from "react";
import {NextPage} from "next";
import {
    Button, Card,
    Grid, Paper,
} from "@mui/material";
import {
    addEdge,
    applyEdgeChanges,
    applyNodeChanges,
    Background,
    ConnectionLineType,
    Controls,
    Panel,
    ReactFlow, useReactFlow
} from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import {useLiveQuery} from "dexie-react-hooks";
import SceneNode from "@/app/components/rf/SceneNode";
import dagre from 'dagre';
import {getScenesWithChoices} from "@/lib/SceneRepository";
import ButtonEdge from '../components/rf/ButtonEdge';
import {GraphSidebarProvider, useSidebar} from "@/app/components/sidebar/graphSidebarProvider";
import GraphSidebar from "@/app/components/sidebar/GraphSidebar";
import NodeMenu from "@/app/components/rf/NodeMenu";

const initialNodes = [];
const initialEdges = [];

const nodeTypes = {
    sceneNode: SceneNode,
};

const edgeTypes = {
    buttonEdge: ButtonEdge,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// Размеры узла (важно для расчетов Dagre)
const nodeWidth = 200;
const nodeHeight = 70;

// Функция для вычисления позиций узлов
const getLayoutedElements = (nodes, edges, direction = 'LR') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({rankdir: direction});

    // Добавление узлов в граф Dagre
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, {width: nodeWidth, height: nodeHeight});
    });

    // Добавление ребер в граф Dagre
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    // Вычисление layout
    dagre.layout(dagreGraph);

    // Обновление позиций узлов
    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            targetPosition: isHorizontal ? 'left' : 'top',
            sourcePosition: isHorizontal ? 'right' : 'bottom',
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return {nodes: layoutedNodes, edges};
};

const {nodes: layoutedNodes, edges: layoutedEdges} = getLayoutedElements(
    initialNodes,
    initialEdges
);


const TestPage: NextPage = () => {
    const {selectedNodeId} = useSidebar();
    const [nodes, setNodes] = useState(layoutedNodes);
    const [edges, setEdges] = useState(layoutedEdges);

    const {setCenter} = useReactFlow();

    const scenes = useLiveQuery(async () => getScenesWithChoices(2))

    // console.log(choices);

    const onNodesChange = useCallback(
        (changes) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
        [],
    );
    const onEdgesChange = useCallback(
        (changes) =>
            setEdges((edgesSnapshot) => {
                // console.log(changes);
                return applyEdgeChanges(changes, edgesSnapshot)
            }),
        [],
    );
    const onConnect = useCallback(
        (params) => setEdges((edgesSnapshot) => {
            // console.log(params, edgesSnapshot);
            return addEdge({...params, type: 'buttonEdge'}, edgesSnapshot)
        }),
        [],
    );

    const onLayout = useCallback(
        (direction: string) => {
            const {nodes: layoutedNodes, edges: layoutedEdges} = getLayoutedElements(
                nodes,
                edges,
                direction
            );
            setNodes([...layoutedNodes]);
            setEdges([...layoutedEdges]);
        },
        [nodes, edges]
    );

    useEffect(() => {
        if (!scenes?.length)
            return;

        // console.log(scenes);

        const edges = scenes.flatMap(scene =>
            scene.data.choices
                .filter(choice => choice.nextSceneId) // Исправлено: проверка на truthy
                .map(choice => ({
                    id: `edge_${scene.id}_c${choice.id}_ns${choice.nextSceneId}`,
                    source: `${scene.id}`,
                    sourceHandle: `c${choice.id}_s${choice.nextSceneId}`,
                    target: `${choice.nextSceneId}`,
                    targetHandle: `s${choice.nextSceneId}`,
                    type: 'buttonEdge',
                }))
        );

        const {nodes: layoutedNodes, edges: layoutedEdges} = getLayoutedElements(
            scenes,
            edges,
            'LR'
        );
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);

        const zoom = 0.7;
        const focusNone = layoutedNodes.find((node) => node.id == selectedNodeId);
        if (focusNone) {
            setCenter(focusNone.position.x, focusNone.position.y, {zoom, duration: 1000});
        } else {
            setCenter(layoutedNodes[0].position.x, layoutedNodes[0].position.y, {zoom, duration: 1000});
        }
    }, [scenes])


    return <Grid container spacing={1} py={1}>
        <div style={{width: '100vw', height: 'calc(100vh - 100px)'}}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}

                // onNodeClick={onNodeClick}

                // fitView
                connectionLineType={ConnectionLineType.SmoothStep}
                colorMode="dark"

                edgeTypes={edgeTypes}
                nodeTypes={nodeTypes}
            >
                {/*<Panel position="top-right">*/}
                {/*    <Card>*/}
                {/*        <Button onClick={() => onLayout('LR')}>Горизонтальный layout</Button>*/}
                {/*    </Card>*/}
                {/*</Panel>*/}
                <NodeMenu onLayout={onLayout}/>
                <Background/>
                <Controls/>
                {/*<ZoomSlider position="top-left" />*/}
            </ReactFlow>
            <GraphSidebar/>
        </div>
    </Grid>
}

export default TestPage;
