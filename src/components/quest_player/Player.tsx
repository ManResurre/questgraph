import React from "react";
import {usePlayer} from "@/components/sidebar/PlayerProvider";
import {Stack} from "@mui/material";
import PlayerText from "@/components/quest_player/PlayerText.tsx";
import PlayerChoicesList from "@/components/quest_player/PlayerChoicesList.tsx";
import PathfinderDialog from "./PathfinderDialog";
import PathfinderScene from "@/components/quest_player/PathfinderScene.tsx";

const Player = () => {
    const {currentScene} = usePlayer();

    return (
        <Stack spacing={0} className="flex flex-col h-[calc(100vh-64px)]">
            {currentScene?.texts && (
                <div
                    className="flex-1 p-1 scrollbar-thin scrollbar-thumb-neutral-800/70 scrollbar-track-transparent"
                >
                    <PathfinderScene>
                        {currentScene.texts.map((t) => {
                            return (
                                <div key={t.id}>

                                    <PlayerText text={t.text ?? ""}/>

                                </div>
                            );
                        })}
                    </PathfinderScene>
                </div>
            )}

            {/*<PlayerChoicesList />*/}
            <div className="mt-auto">
                <PathfinderDialog choices={currentScene?.choices}/>
            </div>
        </Stack>
    );
};

export default React.memo(Player);
