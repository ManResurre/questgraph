import {useQuery} from "@tanstack/react-query";
import {getScenesWithChoices} from "@/lib/SceneRepository";
import {getSceneParameters} from "@/lib/ParametersRepository";

export function useScenesWithChoices(questId: number) {
    return useQuery({
        queryKey: ["scenesWithChoices", questId],
        queryFn: () => getScenesWithChoices(questId),
        enabled: !!questId, // чтобы не запускать без questId
    });
}

export function useSceneParameters(sceneId: number) {
    return useQuery({
        queryKey: ["getSceneParameters", sceneId],
        queryFn: () => getSceneParameters(sceneId),
        enabled: !!sceneId,
    });
}
