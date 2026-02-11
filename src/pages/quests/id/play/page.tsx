import React from "react";
import { useParams } from "@tanstack/react-router";
import { questIdParentRoute } from "@/routes/quests";

const PlayQuestPage = () => {
  // Получаем параметр id из родительского маршрута /quests/$id
  const { id: questId } = useParams({ from: questIdParentRoute.id });

  return (
    <div>
      <h1>Playing Quest: {questId}</h1>
      {/* Здесь будет реализация плеера квеста */}
    </div>
  );
};

export default React.memo(PlayQuestPage);
