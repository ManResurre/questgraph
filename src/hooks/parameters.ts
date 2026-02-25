import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getChoiceParameters,
  getParameters,
  getSceneParameters,
  deleteSceneParameter,
  upsertSceneParameter, upsertParameter, deleteParameter,
} from "@/lib/ParametersRepository";
import {useMemo} from "react";

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

export function useParametersMutations() {
  const queryClient = useQueryClient();
  const upsertPM = useMutation({
    mutationFn: upsertParameter,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['parameters']})
    },
  })

  const deletePM = useMutation({
    mutationFn: deleteParameter,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['parameters']})
    },
  })

  return useMemo(() => ({
    upsertP: upsertPM,
    deleteP: deletePM,
  }), [])
}

export function useParametersSceneMutations() {
  const queryClient = useQueryClient();

  const upsertMutation = useMutation({
    mutationFn: upsertSceneParameter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parameter_scene"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSceneParameter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parameter_scene"] });
    },
  });

  return {
    upsertSceneParameter: upsertMutation.mutateAsync,
    deleteSceneParameter: deleteMutation.mutateAsync,
  };
}
