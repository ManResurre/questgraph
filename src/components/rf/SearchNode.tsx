import React from "react";
import { Button, Stack } from "@mui/material";
import { Position } from "@xyflow/system";
import SceneAutocomplete from "@/components/scene_list/SceneAutocomplete";
import { Controller, useForm } from "react-hook-form";
import { FinalConnectionState, useReactFlow } from "@xyflow/react";
import { setNextSceneId } from "@/lib/ChoiceRepository";
import { useQueryClient } from "@tanstack/react-query";
import { useScenesWithChoices } from "@/hooks/scene";
import CustomHandle from "@/components/rf/CustomHandle";
import { useParams } from "@tanstack/react-router";
import { questIdRoute } from "@/routes/quests";
import { Scene } from "@/lib/SceneRepository";

export interface ISearchNodeFormData {
  scene?: Scene | null;
}

export interface ISearchNodeProps {
  id: string;
  data: {
    connectionState: FinalConnectionState;
  };
}

const SearchNode = ({ id, data }: ISearchNodeProps) => {
  const { id: questId } = useParams({ from: questIdRoute.id });
  const { deleteElements } = useReactFlow();
  const { data: scenes } = useScenesWithChoices(Number(questId));
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ISearchNodeFormData>({
    defaultValues: {
      scene: null,
    },
  });

  const onSubmit = async (search: ISearchNodeFormData) => {
    if (!search || !search.scene) return;
    if (!data.connectionState.fromHandle || !data.connectionState.fromHandle.id)
      return;

    const choiceId = parseInt(data.connectionState.fromHandle.id.substring(1));
    await setNextSceneId(choiceId, search.scene.id);
    await queryClient.invalidateQueries({ queryKey: ["scenesWithChoices"] });
    // await deleteElements({nodes: [{id}]});
  };

  return (
    <div className="min-w-60 hover:ring-1 ring-gray-600 relative border bg-card text-card-foreground dark:bg-neutral-800 rounded-[2px]">
      <div className="flex flex-col gap-y-2 font-normal text-gray-700 dark:text-gray-400">
        <CustomHandle id={id} type={"target"} position={Position.Left} />
        <Stack
          spacing={1}
          component="form"
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
          className="py-2 px-1"
        >
          <Controller
            name="scene"
            control={control}
            render={({ field: { value, onChange } }) => (
              <SceneAutocomplete
                onChange={onChange}
                value={value}
                scenes={scenes?.map((scene) => scene.data)}
              />
            )}
          />

          <Button size="small" variant="contained" type="submit" fullWidth>
            Apply
          </Button>
        </Stack>
      </div>
    </div>
  );
};

export default React.memo(SearchNode);
