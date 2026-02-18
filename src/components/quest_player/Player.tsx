import React from "react";
import { usePlayer } from "@/components/sidebar/PlayerProvider";
import { Stack } from "@mui/material";
import PlayerText from "@/components/quest_player/PlayerText.tsx";
import PathfinderDialog from "./theme/pathfinder/PathfinderDialog.tsx";
import PathfinderScene from "@/components/quest_player/theme/pathfinder/PathfinderScene.tsx";
import SciFiScene from "@/components/quest_player/theme/sciFi/SciFiScene.tsx";
import { Choice } from "@/lib/ChoiceRepository.ts";
import SciFiDialog from "@/components/quest_player/theme/sciFi/SciFiDialog.tsx";

type SceneComponent = React.ComponentType<{ children: React.ReactNode }>;
type DialogComponent = React.ComponentType<{ choices: Choice[] }>;

const sceneEntries = [
  ["pathfinder", { scene: PathfinderScene, dialog: PathfinderDialog }],
  ["sciFi", { scene: SciFiScene, dialog: SciFiDialog }],
] as const;

interface RegistryObject {
  scene: SceneComponent;
  dialog: DialogComponent;
}

export const sceneRegistry = new Map<string, RegistryObject>(sceneEntries);

export type SceneType = (typeof sceneEntries)[number][0];

function getRegistryObject(type?: string): RegistryObject {
  return sceneRegistry.get(type ?? "") ?? sceneRegistry.get("pathfinder")!;
}

const Player = () => {
  const { currentScene } = usePlayer();
  const { scene: SceneComponent, dialog: DialogComponent } = getRegistryObject(
    currentScene?.type,
  );

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
        <DialogComponent choices={currentScene?.choices ?? []} />
      </div>
    </Stack>
  );
};

export default React.memo(Player);
