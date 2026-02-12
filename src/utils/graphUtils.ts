import { CustomEdgeType } from "@/pages/quests/id/constants/graph";
import { SceneNodeType } from "@/components/rf/SceneNode";

/**
 * Создает рёбра для ReactFlow на основе сцен.
 */
export function buildGraphFromScenes(scenes: SceneNodeType[]): {
  nodes: SceneNodeType[];
  edges: CustomEdgeType[];
} {
  if (!scenes?.length) return { nodes: [], edges: [] };

  const edges: CustomEdgeType[] = scenes.flatMap((item) => {
    const scene = item.data;

    return (scene.choices || [])
      .filter((choice) => choice?.nextSceneId)
      .map((choice) => ({
        id: `edge_${scene.id}_c${choice.id}_ns${choice.nextSceneId}`,
        source: `${scene.id}`,
        sourceHandle: `c${choice.id}_s${choice.nextSceneId}`,
        target: `${choice.nextSceneId}`,
        targetHandle: `s${choice.nextSceneId}`,
        type: "buttonEdge" as const,
      }));
  });

  // Возвращаем узлы как есть, без изменений
  const nodes: SceneNodeType[] = scenes;

  return {
    nodes,
    edges,
  };
}
