import React, {useCallback} from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import {SceneText} from "@/lib/db";
import {Box, Button, Checkbox, FormControl, FormControlLabel, IconButton, Stack, TextField} from "@mui/material";
import {Controller, useForm} from "react-hook-form";
import ChoiceAutocomplete from "@/app/components/choice/ChoiceAutocomplete";
import updateScene, {deleteScene} from "@/lib/SceneRepository";
import {useSidebar} from "@/app/components/sidebar/graphSidebarProvider";
import SceneFormText from "@/app/components/scene_list/SceneFormText";
import {useParams} from "next/navigation";
import CheckIcon from '@mui/icons-material/Check';
import {useChoices} from "@/app/hooks/choice";
import {useQueryClient} from "@tanstack/react-query";

interface IChoice {
    id: string | number;
    label: string;
    text: string;
    questId: number;
    nextSceneId: number;
}

export interface ISceneFormData {
    id?: number;
    name: string;
    choices: IChoice[];
    texts: SceneText[];
    quest_id: number;
    locPosition: boolean;
    samplyLink?: string;
}

interface SceneNodeEditProps {
    questId?: number;
    data: {
        id: string;
        name: string;
        choices: IChoice[],
        texts: SceneText[],
        locPosition: boolean;
        samplyLink?: string;
    }
}

const SceneNodeEdit = ({data}: SceneNodeEditProps) => {
    const {questId} = useParams();
    const {closeSidebar, setLoading, loading} = useSidebar();
    const {data: choices} = useChoices(Number(questId));
    const queryClient = useQueryClient();

    const methods = useForm<ISceneFormData>({
        defaultValues: {
            id: Number(data?.id) || undefined,
            name: data?.name ?? '',
            texts: data?.texts ?? [],
            choices: data.choices ?? [],
            quest_id: Number(questId),
            locPosition: data?.locPosition ?? false,
            samplyLink: data.samplyLink
        }
    });

    const {handleSubmit, control, formState: {errors}} = methods;

    const onSubmit = useCallback(async (scene: ISceneFormData) => {
        setLoading(true);
        await updateScene(scene)
        await queryClient.invalidateQueries({queryKey: ["scenesWithChoices"]});
        setLoading(false);
        closeSidebar();
    }, []);

    const handleDelete = useCallback(async () => {
        await deleteScene(Number(data.id));
        await queryClient.invalidateQueries({queryKey: ["scenesWithChoices"]});
        closeSidebar();
    }, [])

    const handleApply = useCallback(async () => {
        await updateScene(methods.getValues());
        await queryClient.invalidateQueries({queryKey: ["scenesWithChoices"]});
    }, [])

    return <Box
        className="py-2 px-1"
        sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
        }}>

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
                    required: "Field is required"
                }}
                render={({field: {value, onChange}}) => (
                    <TextField
                        required
                        id={'scene'}
                        key={'scene'}
                        value={value}
                        onChange={onChange}
                        placeholder={'Scene'}
                        label={'Scene'}
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
                        id={'samplyLink'}
                        key={'samplyLink'}
                        value={value}
                        onChange={onChange}
                        placeholder={'Samply Link'}
                        label={'Samply Link'}
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
                    <ChoiceAutocomplete onChange={onChange} value={value} choices={choices}/>
                )}
            />

            <SceneFormText methods={methods}/>

            <Box display="flex" justifyContent="space-between" gap={1}>
                <Button size="small"
                        variant="contained"
                        type="submit"
                        fullWidth
                >Save</Button>

                <IconButton onClick={() => handleApply()}><CheckIcon/></IconButton>
            </Box>

        </Stack>
        <IconButton onClick={handleDelete}>
            <DeleteIcon/>
        </IconButton>
    </Box>
}

export default React.memo(SceneNodeEdit);
