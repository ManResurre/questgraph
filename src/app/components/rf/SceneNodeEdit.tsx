import React from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import {db, SceneText} from "@/lib/db";
import {Box, Button, Checkbox, FormControl, FormControlLabel, IconButton, Stack, TextField} from "@mui/material";
import {Controller, useForm} from "react-hook-form";
import ChoiceAutocomplete from "@/app/components/choice/ChoiceAutocomplete";
import {useLiveQuery} from "dexie-react-hooks";
import updateScene, {deleteScene, SceneFullData} from "@/lib/SceneRepository";
import {useSidebar} from "@/app/components/sidebar/graphSidebarProvider";
import SceneFormText from "@/app/components/scene_list/SceneFormText";
import {useParams} from "next/navigation";

interface IChoice {
    id: string | number;
    label: string;
    text: string;
    questId: number;
    nextSceneId: number;
}

interface ISceneFormData {
    id?: string | number;
    name: string;
    choices: IChoice[];
    texts: SceneText[];
    questId: number;
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
    const {closeSidebar} = useSidebar();
    const {choices} = useLiveQuery(async () => {
        const choices = await db.choices.where('questId').equals(Number(questId)).toArray();
        return {choices}
    }) ?? {choices: []};

    const methods = useForm<ISceneFormData>({
        defaultValues: {
            id: data?.id || undefined,
            name: data?.name ?? '',
            texts: data?.texts ?? [],
            choices: data.choices ?? [],
            questId: Number(2),
            locPosition: data?.locPosition ?? false,
            samplyLink: data.samplyLink
        }
    });

    const {handleSubmit, control, formState: {errors}} = methods;

    const onSubmit = (scene: ISceneFormData) => {
        updateScene(scene as SceneFullData)
        closeSidebar();
    }

    const handleDelete = () => {
        deleteScene(Number(data.id));
        closeSidebar();
    }

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
            onSubmit={handleSubmit(onSubmit)}
        >

            <Controller
                name="name"
                control={control}
                rules={{
                    required: "Поле 'Scene' обязательно для заполнения"
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
                            label="Фиксировать позицию"
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

            <Button size="small"
                    variant="contained"
                    type="submit"
                    fullWidth
            >Save</Button>

        </Stack>
        <IconButton onClick={handleDelete}>
            <DeleteIcon/>
        </IconButton>
    </Box>
}

export default React.memo(SceneNodeEdit);
