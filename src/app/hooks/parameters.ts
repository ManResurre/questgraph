import {useQuery} from "@tanstack/react-query";
import {getParameterChoice, getParameters} from "@/lib/ParametersRepository";

export function useParameters(questId: number) {
    return useQuery({
        queryKey: ["getParameters", questId],
        queryFn: () => getParameters(questId),
        enabled: !!questId,
    });
}

export function useParameterChoice(id: number) {
    return useQuery({
        queryKey: ["getParameterChoice", id],
        queryFn: () => getParameterChoice(id),
        enabled: !!id,
    });
}
