import {useQuery} from "@tanstack/react-query";
import {getScenesWithChoices} from "@/lib/SceneRepository";

export function useScenesWithChoices(questId: number) {
    return useQuery({
        queryKey: ["scenesWithChoices", questId],
        queryFn: () => getScenesWithChoices(questId),
        enabled: !!questId, // чтобы не запускать без questId
    });
}
