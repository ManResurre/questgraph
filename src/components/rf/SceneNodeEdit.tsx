import React, {useCallback} from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    IconButton,
    Stack,
    TextField,
} from "@mui/material";
import {Controller, useForm} from "react-hook-form";
import ChoiceAutocomplete from "@/components/choice/ChoiceAutocomplete";
import {SceneText} from "@/lib/SceneRepository";
import {useSidebar} from "@/components/sidebar/graphSidebarProvider";
import SceneFormText from "@/components/scene_list/SceneFormText";
import CheckIcon from "@mui/icons-material/Check";
import {useChoices} from "@/hooks/choice";
import {Choice} from "@/lib/ChoiceRepository";
import {useParams} from "@tanstack/react-router";
import {questIdRoute} from "@/routes/quests";
import {useSceneMutations} from "@/hooks/scene";
import {SceneType} from "@/components/quest_player/Player.tsx";

export interface ISceneFormData {
    id: number;
    name: string;
    choices: Choice[];
    texts: SceneText[];
    quest_id: number;
    locPosition: boolean;
    samplyLink?: string;
    type: SceneType;
}

interface SceneNodeEditProps {
    scene: {
        id: string;
        name: string;
        choices: Choice[];
        texts: SceneText[];
        locPosition: boolean;
        samplyLink?: string;
    };
}

const SceneNodeEdit = ({scene}: SceneNodeEditProps) => {
    const {id: questId} = useParams({from: questIdRoute.id});
    const {closeSidebar, setLoading, loading} = useSidebar();
    const {data: choices} = useChoices(Number(questId));
    const {updateScene: updateSceneMutation, deleteScene: deleteSceneMutation} =
        useSceneMutations();

    const methods = useForm<ISceneFormData>({
        defaultValues: {
            id: Number(scene.id),
            name: scene?.name ?? "",
            texts: scene?.texts ?? [],
            choices: scene.choices ?? [],
            quest_id: Number(questId),
            locPosition: scene?.locPosition ?? false,
            samplyLink: scene.samplyLink ?? "",
            type: "pathfinder"
        },
    });

    const {
        handleSubmit,
        control,
        formState: {errors},
    } = methods;

    const saveScene = useCallback(
        async (sceneData: ISceneFormData) => {
            setLoading(true);
            await updateSceneMutation.mutateAsync({
                ...sceneData,
                samplyLink: sceneData.samplyLink ?? null,
                position: sceneData.locPosition ? JSON.stringify({x: 0, y: 0}) : null,
                texts: sceneData.texts.map((text) => ({
                    ...text,
                    scene_id: Number(sceneData.id) || null,
                })),
            });
            setLoading(false);
        },
        [updateSceneMutation],
    );

    const onSubmit = useCallback(
        async (scene: ISceneFormData) => {
            await saveScene(scene);
            closeSidebar();
        },
        [saveScene],
    );

    const handleDelete = useCallback(async () => {
        await deleteSceneMutation.mutateAsync(Number(scene.id));
        closeSidebar();
    }, [scene, deleteSceneMutation]);

    const handleApply = useCallback(async () => {
        await saveScene(methods.getValues());
    }, [methods, saveScene]);

    return (
        <Box
            className="py-2 px-1"
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
            }}
        >
            <Stack
                spacing={1}
                component="form"
                noValidate
                autoComplete="off"
                sx={{width: 1}}
                onSubmit={handleSubmit(onSubmit)}
            >
                <Controller
                    name="name"
                    control={control}
                    rules={{
                        required: "Field is required",
                    }}
                    render={({field: {value, onChange}}) => (
                        <TextField
                            required
                            id={"scene"}
                            key={"scene"}
                            value={value}
                            onChange={onChange}
                            placeholder={"Scene"}
                            label={"Scene"}
                            size="small"
                            error={!!errors.name}
                            helperText={errors.name?.message}
                        />
                    )}
                />

                <Controller
                    name="samplyLink"
                    control={control}
                    render={({field: {value, onChange}}) => (
                        <TextField
                            id={"samplyLink"}
                            key={"samplyLink"}
                            value={value}
                            onChange={onChange}
                            placeholder={"Samply Link"}
                            label={"Samply Link"}
                            size="small"
                            error={!!errors.samplyLink}
                            helperText={errors.samplyLink?.message}
                        />
                    )}
                />

                <FormControl>
                    <Controller
                        name="locPosition"
                        control={control}
                        defaultValue={false}
                        render={({field: {value, onChange}}) => (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={value}
                                        onChange={(e) => onChange(e.target.checked)}
                                    />
                                }
                                label="Hold position"
                            />
                        )}
                    />
                </FormControl>

                <Controller
                    name="choices"
                    control={control}
                    render={({field: {value, onChange}}) => (
                        <ChoiceAutocomplete
                            onChange={onChange}
                            value={value}
                            choices={choices as Choice[]}
                        />
                    )}
                />

                <SceneFormText methods={methods}/>

                <Box display="flex" justifyContent="space-between" gap={1}>
                    <Button size="small" variant="contained" type="submit" fullWidth>
                        Save
                    </Button>

                    <IconButton onClick={() => handleApply()}>
                        <CheckIcon/>
                    </IconButton>
                </Box>
            </Stack>
            <IconButton onClick={handleDelete}>
                <DeleteIcon/>
            </IconButton>
        </Box>
    );
};

export default React.memo(SceneNodeEdit);
