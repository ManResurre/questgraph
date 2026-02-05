import {useCallback, useEffect, useRef} from 'react';
import {
    applyNodeChanges,
    NodeChange,
    useNodesInitialized,
    useReactFlow
} from '@xyflow/react';
import dagre from 'dagre';
import {updatePositions, UpdatePositionsProps} from "@/lib/SceneRepository";
import {CustomEdgeType, SceneNodeType} from "@/app/quests/[questId]/constants/graph";
import {useParams} from "next/navigation";

const defaultNodeWidth = 200;
const defaultNodeHeight = 70;

const dagreGraph = new dagre.graphlib.Graph();

export default function useLayoutElements() {
    const {questId} = useParams();
    const {getNodes, getEdges, setNodes, fitView} = useReactFlow();

    const nodesInitialized = useNodesInitialized();

    const setupPositions = useCallback(
        (direction: 'LR' | 'TB' = 'LR') => {
            dagreGraph.setDefaultEdgeLabel(() => ({}));
            dagreGraph.setGraph({
                rankdir: direction,
                align: 'UL',
                edgesep: 5,
                acyclicer: 'greedy',
                ranker: 'network-simplex'
            });

            const nodes = getNodes();
            const edges = getEdges();

            nodes.forEach((node) => {
                const width = node.measured?.width || defaultNodeWidth;
                const height = node.measured?.height || defaultNodeHeight;

                dagreGraph.setNode(node.id, {
                    width: width + 35,
                    height: height + 35
                });
            });

            edges.forEach((edge) => {
                dagreGraph.setEdge(edge.source, edge.target, {
                    minlen: 2,
                    weight: 1,
                    curve: 'simple'
                });
            });

            dagre.layout(dagreGraph);

            const newPositions: NodeChange<SceneNodeType>[] = nodes
                .filter((node) => node.type === 'sceneNode' && !node.data.locPosition)
                .map((node) => {
                    const nodeWithPosition = dagreGraph.node(node.id);
                    const width = node.measured?.width || 150;
                    const height = node.measured?.height || 50;

                    const x = nodeWithPosition.x - width / 2;
                    const y = nodeWithPosition.y - height / 2;

                    return {
                        id: node.id,
                        type: 'position',
                        position: {x, y},
                        dragging: false
                    } as NodeChange<SceneNodeType>;
                });

            updatePositions(Number(questId), newPositions as UpdatePositionsProps[]).then(() => {
                const selectedNode = localStorage.getItem('selectedNode');
                setNodes((prev) => applyNodeChanges(newPositions, prev));

                fitView({
                    nodes: [{id: selectedNode || nodes[0]?.id}],
                    duration: 800,
                    padding: 0.5,
                    interpolate: 'smooth',
                    maxZoom: 0.7
                });
            });
        },
        [questId, fitView]
    );

    useEffect(() => {
        if (!nodesInitialized) {
            console.log('Узлы еще не готовы для расчета компоновки.');
            return;
        }

        setupPositions();

    }, [nodesInitialized, setupPositions]);

    return {onLayout: setupPositions};
}
