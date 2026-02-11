import React from "react";
import { Card, CardContent, Theme, SxProps } from "@mui/material";
import PlayerChoices from "@/components/quest_player/PlayerChoices.tsx";
import { usePlayer } from "@/components/sidebar/PlayerProvider";

interface PlayerChoicesListProps {
  cardSx?: SxProps<Theme>;
  cardContentSx?: SxProps<Theme>;
  listStyle?: React.CSSProperties;
}

const PlayerChoicesList = ({
  cardSx,
  cardContentSx,
  listStyle = {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
}: PlayerChoicesListProps) => {
  const { currentScene } = usePlayer();

  const choices = currentScene ? currentScene.choices : [];

  if (!choices?.length) {
    return null;
  }

  return (
    <Card sx={cardSx}>
      <CardContent sx={{ padding: "16px 0", ...cardContentSx }}>
        <ol
          style={{
            ...listStyle,
          }}
        >
          {choices.map((ch, index) => (
            <PlayerChoices
              key={`player_choice_${index}`}
              index={index}
              choice={ch}
            />
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};

export default React.memo(PlayerChoicesList);
