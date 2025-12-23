import {getChoices} from "@/lib/ChoiceRepository";
import {useQuery} from "@tanstack/react-query";

export function useChoices(questId: number) {
    return useQuery({
        queryKey: ["getChoices", questId],
        queryFn: () => getChoices(questId),
        enabled: !!questId,
    });
}
