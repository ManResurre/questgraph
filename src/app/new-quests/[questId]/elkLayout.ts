// import ELK, {ElkNode} from 'elkjs/lib/elk.bundled.js';
// import {CustomEdgeType, SceneNodeType} from "@/app/new-quests/[questId]/page";
// import {Choice} from "@/lib/db";
//
// const elk = new ELK();
//
// const getLayoutedElements = (nodes: SceneNodeType[], edges: CustomEdgeType[]) => {
//     const graph: ElkNode = {
//         id: "root",
//         layoutOptions: {
//             'elk.algorithm': 'layered',
//             'elk.direction': 'RIGHT',
//             'org.eclipse.elk.portConstraints': 'FIXED_ORDER',
//             'elk.layered.spacing.edgeNodeBetweenLayers': '140',
//             'elk.spacing.nodeNode': '140',
//             'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
//             'elk.layered.nodePlacement.favorStraightEdges': 'true',
//             'elk.layered.cycleBreaking.strategy': 'GREEDY',
//             'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
//         },
//         children: nodes.map((node) => ({
//             ...node,
//             width: node.measured?.width, // Укажите ширину ноды
//             height: node.measured?.height, // Укажите высоту ноды
//             // Определяем порты для ELKjs
//             ports: [
//                 {id: `s${node.data.id}`, properties: {'elk.port.side': 'WEST'}},
//                 //@ts-ignore
//                 ...node.data?.choices.map((choice: Choice) => {
//                     return {id: `c${choice.id}_s${choice.nextSceneId ?? ''}`, properties: {'elk.port.side': 'EAST'}}
//                 })
//             ],
//         })),
//         edges: edges.map((edge) => ({
//             ...edge,
//             // Для соединения с конкретным портом используйте sourceHandle и targetHandle
//             sources: [edge.sourceHandle], // Например, 'source-a'
//             targets: [edge.targetHandle], // Например, 'target'
//         })),
//     };
//
//     return elk.layout(graph).then((layoutedGraph) => {
//         // Преобразование результата обратно для React Flow
//         const layoutedNodes = layoutedGraph.children.map((node) => ({
//             ...node,
//             position: {x: node.x, y: node.y},
//         }));
//         return {nodes: layoutedNodes, edges: layoutedGraph.edges};
//     });
// };
//
// export default getLayoutedElements;
