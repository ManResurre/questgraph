import {useCallback, useEffect} from 'react';
import {useNodesInitialized, useReactFlow} from '@xyflow/react';
import dagre from 'dagre';
import {CustomEdgeType, SceneNodeType} from "@/app/new-quests/[questId]/page";
import getLayoutedElements from "@/app/new-quests/[questId]/elkLayout";
import {useSidebar} from "@/app/components/sidebar/graphSidebarProvider";

const defaultNodeWidth = 200;
const defaultNodeHeight = 70;

function useLayoutedElements({nodes, edges, setNodes, setEdges}: {
    setNodes: (value: (((prevState: SceneNodeType[]) => SceneNodeType[]) | SceneNodeType[])) => void;
    nodes: SceneNodeType[];
    edges: CustomEdgeType[];
    setEdges: (value: (((prevState: CustomEdgeType[]) => CustomEdgeType[]) | CustomEdgeType[])) => void
}) {
    const nodesInitialized = useNodesInitialized(); // Проверяем, отмерились ли узлы
    const {setCenter} = useReactFlow();
    const {selectedNodeId} = useSidebar();

    const setupPositions = useCallback((direction = 'LR') => {
        // const res =  getLayoutedElements(getNodes(), edges).then((data)=>{
        //     setNodes(data.nodes as SceneNodeType[]);
        //     setEdges(data.edges);
        // });

        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        dagreGraph.setGraph({rankdir: direction});

        nodes.forEach((node) => {
            const width = node.measured?.width || defaultNodeWidth;
            const height = node.measured?.height || defaultNodeHeight;

            dagreGraph.setNode(node.id, {width, height});
        });

        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        const isHorizontal = direction === 'LR';
        const layoutNodes = nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            const width = node.measured?.width || 150;
            const height = node.measured?.height || 50;

            // Смещаем позицию так, чтобы центр узла Dagre совпал с верхним левым углом узла React Flow
            const x = nodeWithPosition.x - width / 2;
            const y = nodeWithPosition.y - height / 2;

            return {
                ...node,
                position: {x, y},
                targetPosition: isHorizontal ? 'left' : 'top',
                sourcePosition: isHorizontal ? 'right' : 'bottom',
            };
        });

        setNodes(layoutNodes as SceneNodeType[]);
        setEdges(edges);

        const firstNode = layoutNodes[0];
        setCenter(firstNode.position.x, firstNode.position.y, {
            zoom: 0.5,
            duration: 1000
        });

        window.requestAnimationFrame(() => {
            // fitView(); // Подгоняем viewport после обновления узлов
        });
    }, [nodes, edges, setNodes, setEdges, nodesInitialized]); // Зависимости хука

    useEffect(() => {
        if (!selectedNodeId)
            return;

        const foundNode = nodes.find(node => node.data.id === selectedNodeId)
        if (!foundNode)
            return;

        setCenter(foundNode.position.x, foundNode.position.y, {
            zoom: 0.5,
            duration: 1000
        });
    }, [selectedNodeId])

    useEffect(() => {
        if (!nodesInitialized) {
            console.log('Узлы еще не готовы для расчета компоновки.');
            return;
        }
        setupPositions();
    }, [nodesInitialized])

    return {onLayout: setupPositions}
}

export default useLayoutedElements;