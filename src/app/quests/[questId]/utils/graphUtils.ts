import {SceneFullData} from "@/lib/SceneRepository";
import {CustomEdgeType, SceneNodeType} from "@/app/quests/[questId]/constants/graph";

/**
 * Преобразует список сцен в массив узлов и рёбер для ReactFlow.
 */
export function buildGraphFromScenes(
    scenes: SceneFullData[]
): { nodes: SceneNodeType[]; edges: CustomEdgeType[] } {
    if (!scenes?.length) return {nodes: [], edges: []};

    const edges: CustomEdgeType[] = scenes.flatMap(scene =>
        scene.data.choices
            .filter(choice => choice.nextSceneId)
            .map(choice => ({
                id: `edge_${scene.id}_c${choice?.id}_ns${choice?.nextSceneId}`,
                source: `${scene.id}`,
                sourceHandle: `c${choice?.id}_s${choice?.nextSceneId}`,
                target: `${choice?.nextSceneId}`,
                targetHandle: `s${choice?.nextSceneId}`,
                type: "buttonEdge" as const,
            }))
    );

    return {
        nodes: scenes as SceneNodeType[],
        edges,
    };
}
