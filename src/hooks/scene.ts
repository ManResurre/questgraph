import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import updateScene, {
  deleteScene,
  getScenesWithChoices,
} from "@/lib/SceneRepository";

export function useSceneMutations() {
  const queryClient = useQueryClient();

  const updateSM = useMutation({
    mutationFn: updateScene,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenesWithChoices"] });
    },
  });

  const deleteSM = useMutation({
    mutationFn: deleteScene,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenesWithChoices"] });
    },
  });

  return {
    updateScene: updateSM,
    deleteScene: deleteSM,
  };
}

export function useScenesWithChoices(questId: number) {
  return useQuery({
    queryKey: ["scenesWithChoices", questId],
    queryFn: () => getScenesWithChoices(questId),
    enabled: !!questId,
  });
}
