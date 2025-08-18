'use client';
import {useParams} from "next/navigation";
import React, {useEffect, useState} from "react";
import {db, Game, Scene} from "@/lib/db";
import {useQuestContext} from "@/app/components/quest_list/QuestsProvider";
import SceneTextList from "@/app/components/scene_list/SceneTextList";
import ChoiceSceneList from "@/app/components/choice/ChoiceSceneList";
import {useSceneContext} from "@/app/components/scene_list/SceneProvider";

export default function PlayerPage() {
    const {questId} = useParams();
    const questIdNum = Number(questId!);
    const {service: questService} = useQuestContext();
    const {service: sceneService} = useSceneContext();
    const [scenes, setScenes] = useState<Scene[]>();
    const [selectedScene, setSelectedScene] = useState<Scene>();

    useEffect(() => {
        if (!questService)
            return;

        db.scenes.where('questId')
            .equals(questIdNum)
            .toArray()
            .then((scenes) => {
                scenes.sort((a, b) => a.id! - b.id!);
                setScenes(scenes);
                setSelectedScene(scenes[0]);
            });
    }, [questService])

    useEffect(() => {
        if (!selectedScene || !questService)
            return;

        const game: Game = {
            questId: questIdNum,
            sceneId: selectedScene.id!,
            userId: questService.user.id
        };

        const gameId = localStorage.getItem('gameId');
        if (gameId) {
            game.id = Number(gameId);
        }

        db.game.put(game).then((gameId) => {
            localStorage.setItem('gameId', String(gameId))
        });
    }, [selectedScene, questService])

    useEffect(() => {
        if (!sceneService)
            return;

        const nextScene = scenes?.find((scene) => scene.id === sceneService.selectedSceneId);
        setSelectedScene(nextScene);
    }, [sceneService, sceneService?.selectedSceneId])

    return <div>
        {selectedScene &&
            <>
                <SceneTextList sceneId={selectedScene.id!}/>
                <ChoiceSceneList sceneId={selectedScene.id!}/>
            </>
        }
    </div>
}