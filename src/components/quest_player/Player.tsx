import React from "react";
import { usePlayer } from "@/components/sidebar/PlayerProvider";
import { Stack, Drawer, Box } from "@mui/material";
import PlayerText from "@/components/quest_player/PlayerText.tsx";
import PathfinderDialog from "./theme/pathfinder/PathfinderDialog.tsx";
import PathfinderScene from "@/components/quest_player/theme/pathfinder/PathfinderScene.tsx";
import SciFiScene from "@/components/quest_player/theme/sciFi/SciFiScene.tsx";
import { Choice } from "@/lib/ChoiceRepository.ts";
import SciFiDialog from "@/components/quest_player/theme/sciFi/SciFiDialog.tsx";
import Status from "@/components/quest_player/Status.tsx";
import { useParams } from "@tanstack/react-router";
import { questIdParentRoute } from "@/routes/quests";

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
  return sceneRegistry.get(type ?? "") ?? sceneRegistry.get("sciFi")!;
}

const Player = () => {
  const { id: questId } = useParams({ from: questIdParentRoute.id });
  const { currentScene } = usePlayer();
  const { scene: SceneComponent, dialog: DialogComponent } = getRegistryObject(
    currentScene?.type,
  );

  const statusList = [
    { id: 1, name: "Health", value: 100 },
    { id: 2, name: "Mana", value: 50 },
    { id: 3, name: "Stamina", value: 75 },
  ];

  return (
    <Box className="flex h-[calc(100vh-64px)]">
      <Stack spacing={0} className="flex-1 flex flex-col">
        {currentScene?.texts && (
          <div className="flex-1 p-1 scrollbar-thin scrollbar-thumb-neutral-800/70 scrollbar-track-transparent">
            <SceneComponent>
              {currentScene.texts.map((t) => {
                return (
                  <div key={t.id}>
                    <PlayerText key={t.id} text={t.text ?? ""} />
                  </div>
                );
              })}

              <DialogComponent choices={currentScene?.choices ?? []} />
            </SceneComponent>
          </div>
        )}

        {/*<PlayerChoicesList />*/}
        <div className="mt-auto"></div>
      </Stack>

      <Drawer
        variant="permanent"
        anchor="right"
        sx={{
          width: 240,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 240,
            boxSizing: "border-box",
            top: 64,
            height: "calc(100vh - 64px)",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Status statusList={statusList} />
        </Box>
      </Drawer>
    </Box>
  );
};

export default React.memo(Player);
