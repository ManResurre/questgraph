import React from "react";
import { Button } from "@mui/material";
import { usePlayer } from "@/components/sidebar/PlayerProvider";
import { Choice } from "@/lib/ChoiceRepository";

export interface ChoiceButtonProps {
  choice: Choice;
}

const ChoiceButton = ({ choice }: ChoiceButtonProps) => {
  const { setScene } = usePlayer();
  const handleClick = (sceneId: number | null) => {
    if (sceneId) setScene(sceneId);
  };

  return (
    <Button
      sx={{
        flex: 1,
        justifyContent: "flex-start",
        textAlign: "left",
        textTransform: "none",
        fontSize: "1.1rem",
        color: "#e0e0e0",
        fontFamily: "system-ui, sans-serif",
        whiteSpace: "normal", // Разрешаем перенос слов
        wordBreak: "break-word", // Перенос длинных слов
        wordWrap: "break-word", // Обертка слов
        overflowWrap: "break-word", // Современное свойство для переноса
        lineHeight: 1.4,
        padding: "2px 6px",
        minHeight: "52px",
        backgroundColor: "rgba(30, 30, 30, 0.7)",
        border: "1px solid rgba(100, 100, 100, 0.3)",
        borderRadius: "4px",
        "&:hover": {
          backgroundColor: "rgba(50, 50, 50, 0.9)",
          border: "1px solid rgba(120, 120, 120, 0.5)",
          transform: "translateY(-1px)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
        },
        "&:active": {
          transform: "translateY(0)",
        },
        transition: "all 0.2s ease",
      }}
      variant="text"
      // className="text-lg text-gray-300 font-sans whitespace-pre-wrap break-words leading-5"
      onClick={() => handleClick(choice?.nextSceneId)}
      fullWidth
    >
      {choice.text}
    </Button>
  );
};

export default React.memo(ChoiceButton);
