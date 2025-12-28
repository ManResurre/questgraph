import {useQuery} from "@tanstack/react-query";
import {getParameters} from "@/lib/ParametersRepository";

export function useParameters(questId: number) {
    return useQuery({
        queryKey: ["getParameters", questId],
        queryFn: () => getParameters(questId),
        enabled: !!questId,
    });
}
