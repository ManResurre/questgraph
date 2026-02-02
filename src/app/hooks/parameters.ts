import {useQuery} from "@tanstack/react-query";
import {getParameterChoice, getParameters, getSceneParameters} from "@/lib/ParametersRepository";

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

export function useParameterChoice(id: number) {
    return useQuery({
        queryKey: ["getParameterChoice", id],
        queryFn: () => getParameterChoice(id),
        enabled: !!id,
    });
}
