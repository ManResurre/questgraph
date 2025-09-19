import {Choice, db, Scene} from "@/lib/db";
import {Box, Button, FormControl, Stack, TextField} from "@mui/material";
import {Controller, useForm} from "react-hook-form";
import SceneFormText from "@/app/components/scene_list/SceneFormText";
import SceneFormChoice from "@/app/components/scene_list/SceneFormChoice";
import React from "react";
import {OptionsFormData} from "@/app/components/params_view/IParamsView";
import ChoiceAutocomplete from "@/app/components/choice/ChoiceAutocomplete";
import {useLiveQuery} from "dexie-react-hooks";
import {updateChoices} from "@/lib/SceneRepository";
import {plainToClass, plainToInstance} from "class-transformer";

interface IChoice {
    id: string | number;
    label: string;
    text: string;
    questId: number;
    nextSceneId: number;
}

interface ISceneFormData {
    id?: string | number;
    label: string;
    choices: IChoice[];
    questId: number;
}

interface SceneNodeEditProps {
    questId?: number; //TODO WIP
    data: {
        id: string;
        label: string;
        choices: IChoice[]
    }
}

export default function SceneNodeEdit({data}: SceneNodeEditProps) {
    const {choices} = useLiveQuery(async () => {
        const choices = await db.choices.where('questId').equals(2).toArray();
        return {choices}
    }) ?? {choices: []};

    const {handleSubmit, control, formState: {errors}} = useForm<ISceneFormData>({
        defaultValues: {
            id: data?.id || undefined,
            label: data?.label ?? '',
            // texts: data?.texts ?? [],
            choices: data.choices ?? [],
            questId: Number(2)
        }
    });

    const onSubmit = (scene: ISceneFormData) => {
        updateChoices(Number(scene.id), scene.choices as Choice[]);
    }

    return <Stack
        spacing={1}
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
        className="py-2 px-1"
    >

        <Controller
            name="label"
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
                    error={!!errors.label}          // Показываем состояние ошибки
                    helperText={errors.label?.message} // Отображаем сообщение об ошибке
                />
            )}
        />

        <Controller
            name="choices"
            control={control}
            render={({field: {value, onChange}}) => (
                <ChoiceAutocomplete onChange={onChange} value={value} choices={choices}/>
            )}
        />


        {/*<SceneFormText methods={methods}/>*/}
        {/*<SceneFormChoice methods={methods}/>*/}


        <Button size="small"
                variant="contained"
                type="submit"
                fullWidth
        >Save</Button>

    </Stack>
}