import React from "react";
import {useParams} from "@tanstack/react-router";
import {questIdParentRoute} from "@/routes/quests";
import Player from "@/components/quest_player/Player.tsx";
import {PlayerProvider} from "@/components/sidebar/PlayerProvider.tsx";

const PlayQuestPage = () => {
    // Получаем параметр id из родительского маршрута /quests/$id
    const {id: questId} = useParams({from: questIdParentRoute.id});

    return  <PlayerProvider>
                <Player/>
            </PlayerProvider>
};

export default React.memo(PlayQuestPage);
