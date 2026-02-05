'use client';
import {
    Box,
    Button,
    Stack,
    TextField
} from "@mui/material";
import {Controller, FormProvider, useForm} from "react-hook-form";
import React, {useRef} from "react";
import {useSceneContext} from "@/app/components/scene_list/SceneProvider";
import {redirect, useParams} from "next/navigation";
import {Choice, Scene, SceneText} from "@/lib/db";
import SceneFormChoice from "@/app/components/scene_list/SceneFormChoice";
import SceneFormText from "@/app/components/scene_list/SceneFormText";
// import { format } from '@codemirror/formatting';

export interface ISceneFormProps {
    scene?: any;
}

export interface ISceneFormData extends Scene {
    id?: number;
    name: string;
    texts: Partial<SceneText>[];
    choices: Partial<Choice>[];
    quest_id: number;
}

function SceneForm({scene}: ISceneFormProps) {
    const {service} = useSceneContext();
    const {questId, sceneId} = useParams();

    const elementRef = useRef(null);

    const methods = useForm<ISceneFormData>({
        defaultValues: {
            id: scene?.id || undefined,
            name: scene?.name ?? '',
            texts: scene?.texts ?? [],
            choices: scene?.choices ?? [],
            quest_id: Number(questId)
        }
    });

    const {control, handleSubmit, formState: {errors}} = methods;


    const onSubmit = async (data: any) => {
        await service?.create(data);
        if (sceneId) {
            redirect('../../');
        }
        redirect('../');
    };

    const handleInnerSubmit = async (e: any) => {
        e.stopPropagation();
        await handleSubmit(onSubmit)(e);
    };

    // useEffect(() => {
    //     const observer = new IntersectionObserver((entries) => {
    //         const [entry] = entries;
    //         if (!entry.isIntersecting) {
    //             console.log('Элемент скрыт!');
    //         }
    //     }, {threshold: 0});
    //
    //     if (elementRef.current) {
    //         observer.observe(elementRef.current);
    //     }
    //
    //     return () => {
    //         if (elementRef.current) {
    //             observer.unobserve(elementRef.current);
    //         }
    //     };
    // }, []);

    return <FormProvider {...methods}>
        <Stack
            spacing={1}
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={handleInnerSubmit}
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


            <SceneFormText methods={methods}/>
            <SceneFormChoice methods={methods}/>

            <Box
                ref={elementRef}
            >
                <Button size="small"
                        variant="contained"
                        type="submit"
                        fullWidth
                >Save</Button>
            </Box>
        </Stack>
    </FormProvider>
}

export default SceneForm;
