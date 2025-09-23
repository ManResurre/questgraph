import {Choice, db, SceneText} from "@/lib/db";
import {Button, Stack, TextField} from "@mui/material";
import {Controller, useForm} from "react-hook-form";
import React from "react";
import ChoiceAutocomplete from "@/app/components/choice/ChoiceAutocomplete";
import {useLiveQuery} from "dexie-react-hooks";
import updateScene, {SceneFullData, updateChoices, updateSceneTexts} from "@/lib/SceneRepository";
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
}

interface SceneNodeEditProps {
    questId?: number; //TODO WIP
    data: {
        id: string;
        name: string;
        choices: IChoice[],
        texts: SceneText[]
    }
}

export default function SceneNodeEdit({data}: SceneNodeEditProps) {
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
            questId: Number(2)
        }
    });

    const {handleSubmit, control, formState: {errors}} = methods;

    const onSubmit = (scene: ISceneFormData) => {
        updateScene(scene as SceneFullData)
        closeSidebar();
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
                    error={!!errors.name}          // Показываем состояние ошибки
                    helperText={errors.name?.message} // Отображаем сообщение об ошибке
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


        <SceneFormText methods={methods}/>
        {/*<SceneFormChoice methods={methods}/>*/}


        <Button size="small"
                variant="contained"
                type="submit"
                fullWidth
        >Save</Button>

    </Stack>
}