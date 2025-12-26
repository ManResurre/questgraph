import {getChoice, getChoices} from "@/lib/ChoiceRepository";
import {useQuery} from "@tanstack/react-query";

export function useChoices(questId: number) {
    return useQuery({
        queryKey: ["getChoices", questId],
        queryFn: () => getChoices(questId),
        enabled: !!questId,
    });
}

export function useChoice(id: number) {
    return useQuery({
        queryKey: ["getChoice", id],
        queryFn: () => getChoice(id),
        enabled: !!id,
    });
}
