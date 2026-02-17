import React from "react";
import {usePlayer} from "@/components/sidebar/PlayerProvider";
import {Stack} from "@mui/material";
import PlayerText from "@/components/quest_player/PlayerText.tsx";
import PathfinderDialog from "./PathfinderDialog";
import PathfinderScene from "@/components/quest_player/PathfinderScene.tsx";
import SciFiScene from "@/components/quest_player/SciFiScene.tsx";

type SceneComponent = React.ComponentType<{ children: React.ReactNode }>;

const sceneEntries = [
    ["pathfinder", PathfinderScene],
    ["sciFi", SciFiScene],
] as const;

export const sceneRegistry = new Map<string, SceneComponent>(sceneEntries);

export type SceneType = (typeof sceneEntries)[number][0];

const Player = () => {
    const {currentScene} = usePlayer();

  const SceneComponent =
    sceneRegistry.get(currentScene?.type ?? "") ?? PathfinderScene;

  return (
    <Stack spacing={0} className="flex flex-col h-[calc(100vh-64px)]">
      {currentScene?.texts && (
        <div className="flex-1 p-1 scrollbar-thin scrollbar-thumb-neutral-800/70 scrollbar-track-transparent">
          <SceneComponent>
            {currentScene.texts.map((t) => {
              return (
                <div key={t.id}>
                  <PlayerText text={t.text ?? ""} />
                </div>
              );
            })}
          </SceneComponent>
        </div>
      )}

      {/*<PlayerChoicesList />*/}
      <div className="mt-auto">
        <PathfinderDialog choices={currentScene?.choices} />
      </div>
    </Stack>
  );
};

export default React.memo(Player);
