import React from "react";
import { usePlayer } from "@/components/sidebar/PlayerProvider";
import { Stack } from "@mui/material";
import PlayerText from "@/components/quest_player/PlayerText.tsx";
import PlayerChoicesList from "@/components/quest_player/PlayerChoicesList.tsx";

const Player = () => {
  const { currentScene } = usePlayer();

  return (
    <Stack spacing={0}>
      {currentScene?.texts && (
        <div
          className="p-3 bg-neutral-900/50 dark:bg-neutral-700/30 border border-gray-500 dark:border-neutral-600 rounded-[4px] min-h-[250px] max-h-[vh] overflow-y-auto
                    scrollbar-thin scrollbar-thumb-neutral-800/70 scrollbar-track-transparent"
        >
          <div className="text-lg text-gray-300 font-sans whitespace-pre-wrap break-words leading-5">
            {currentScene.texts.map((t) => {
              return (
                <div key={t.id}>
                  <PlayerText text={t.text ?? ""} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <PlayerChoicesList />
    </Stack>
  );
};

export default React.memo(Player);
