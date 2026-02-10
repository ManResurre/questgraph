import {useQuery} from "@tanstack/react-query";
import {getChoiceParameters, getParameters, getSceneParameters} from "@/lib/ParametersRepository";

export function useParametersQuery(questId: number) {
    return useQuery({
        queryKey: ["parameters", questId],
        queryFn: () => getParameters(questId),
        enabled: !!questId,
    });
}

export function useParametersSceneQuery(sceneId: number) {
    return useQuery({
        queryKey: ["parameter_scene", sceneId],
        queryFn: () => getSceneParameters(sceneId),
        enabled: !!sceneId,
    });
}

export function useChoiceParameters(choice_id: number) {
    return useQuery({
        queryKey: ["parameter_choice", choice_id],
        queryFn: () => getChoiceParameters(choice_id),
        enabled: !!choice_id,
    });
}
