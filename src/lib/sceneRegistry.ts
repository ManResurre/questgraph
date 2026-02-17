import PathfinderScene from "@/components/quest_player/PathfinderScene.tsx";
import SciFiScene from "@/components/quest_player/SciFiScene.tsx";

type SceneComponent = React.ComponentType<{ children: React.ReactNode }>;

export const sceneRegistry = new Map<string, SceneComponent>([
  ["pathfinder", PathfinderScene],
  ["sciFi", SciFiScene],
]);

export type SceneType = "pathfinder" | "sciFi";

export const sceneLabels: Record<SceneType, string> = {
  pathfinder: "Pathfinder",
  sciFi: "Sci-Fi",
};
