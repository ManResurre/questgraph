import {useCallback, useEffect} from 'react';
import {applyNodeChanges, NodeChange, useNodesInitialized, useReactFlow} from '@xyflow/react';
import dagre from 'dagre';
import {CustomEdgeType, SceneNodeType} from "@/app/new-quests/[questId]/page";
import {updatePositions, UpdatePositionsProps} from "@/lib/SceneRepository";

const defaultNodeWidth = 200;
const defaultNodeHeight = 70;

const dagreGraph = new dagre.graphlib.Graph();
let timeout;

function useLayoutedElements({nodes, edges, setNodes, setEdges}: {
    setNodes: (value: (((prevState: SceneNodeType[]) => SceneNodeType[]) | SceneNodeType[])) => void;
    nodes: SceneNodeType[];
    edges: CustomEdgeType[];
    setEdges: (value: (((prevState: CustomEdgeType[]) => CustomEdgeType[]) | CustomEdgeType[])) => void
}) {
    const nodesInitialized = useNodesInitialized(); // Проверяем, отмерились ли узлы
    const {fitView} = useReactFlow();

    const setupPositions = useCallback((direction = 'LR') => {
        // const res =  getLayoutedElements(getNodes(), edges).then((data)=>{
        //     setNodes(data.nodes as SceneNodeType[]);
        //     // setEdges(data.edges);
        // });

        dagreGraph.setDefaultEdgeLabel(() => ({}));
        dagreGraph.setGraph({
            rankdir: direction,
            // ranksep: 35,   // расстояние между рангами
            // nodesep: 35,   // расстояние между узлами в одном ранге
            // marginx: 35,   // отступ по x
            // marginy: 35,
            align: 'UL',
            edgesep: 5,
            acyclicer: 'greedy',
            ranker: 'network-simplex'
        });

        nodes.forEach((node) => {
            const width = node.measured?.width || defaultNodeWidth;
            const height = node.measured?.height || defaultNodeHeight;

            dagreGraph.setNode(node.id, {
                width: width + 35,
                height: height + 35,
            });
        });

        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target, {
                // Минимальная длина ребра
                minlen: 2,
                // Вес ребра (влияет на приоритет при расположении)
                weight: 1,
                // Настройки для изгибов
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

                // Смещаем позицию так, чтобы центр узла Dagre совпал с верхним левым углом узла React Flow
                const x = nodeWithPosition.x - width / 2;
                const y = nodeWithPosition.y - height / 2;

                return {
                    dragging: false,
                    id: node.id,
                    position: {
                        x, y
                    },
                    type: "position"
                } as NodeChange<SceneNodeType>;
            });

        updatePositions(newPositions as UpdatePositionsProps[])
        // setNodes(nodes => applyNodeChanges(newPositions, nodes))

        fitView({
            nodes: [{id: nodes[0].id}],
            duration: 800,
            padding: 0.5,
            interpolate: 'smooth',
            maxZoom: 0.7 // если хотите ограничить zoom
        });

    }, [nodesInitialized]); // Зависимости хука


    useEffect(() => {
        if (!nodesInitialized) {
            console.log('Узлы еще не готовы для расчета компоновки.');
            return;
        }
        // setupPositions();

    }, [nodesInitialized])

    return {onLayout: setupPositions}
}

export default useLayoutedElements;
