import { SceneFullData, SceneNodeForFlow } from "@/lib/SceneRepository";
import {
  CustomEdgeType,
  SceneNodeType,
} from "@/pages/quests/id/constants/graph";

/**
 * Преобразует список сцен в массив узлов и рёбер для ReactFlow.
 */
export function buildGraphFromScenes(
  scenes: (SceneFullData | SceneNodeForFlow)[],
): {
  nodes: SceneNodeType[];
  edges: CustomEdgeType[];
} {
  if (!scenes?.length) return { nodes: [], edges: [] };

  const edges: CustomEdgeType[] = scenes.flatMap((item) => {
    // Определяем, является ли элемент SceneFullData или SceneNodeForFlow
    const scene: SceneFullData =
      "data" in item ? item.data : (item as SceneFullData);

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

  // Преобразуем SceneFullData в SceneNodeType (Node<SceneFullData>), добавляя необходимые поля
  const nodes: SceneNodeType[] = scenes.map((item) => {
    // Определяем, является ли элемент SceneFullData или SceneNodeForFlow
    const scene: SceneFullData =
      "data" in item ? item.data : (item as SceneFullData);

    return {
      id: String(scene.id), // Убедимся, что id является строкой
      type: "sceneNode",
      position: { x: 0, y: 0 }, // Устанавливаем начальную позицию
      data: scene, // Используем всю сцену как данные узла
    };
  });

  return {
    nodes,
    edges,
  };
}
