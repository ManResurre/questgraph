'use client';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader, Divider, Grid,
    Paper,
    Stack,
    TextField
} from "@mui/material";
import {Controller, FormProvider, useFieldArray, useForm} from "react-hook-form";
import React, {useEffect, useRef, useState} from "react";
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import CodeMirror, {EditorView} from '@uiw/react-codemirror';
import {darcula} from '@uiw/codemirror-theme-darcula';
import {langs} from '@uiw/codemirror-extensions-langs';
import {keymap} from '@codemirror/view';
import {abbreviationTracker, expandAbbreviation} from '@emmetio/codemirror6-plugin';
import {Prec} from "@codemirror/state";
import {Add} from "@mui/icons-material";
import ChoiceForm from "@/app/components/choice/ChoiceForm";
import {useSceneContext} from "@/app/components/scene_list/SceneProvider";
import {IScene, SceneService} from "@/app/components/scene_list/SceneService";
import {redirect, useParams} from "next/navigation";
import {Choice, Scene} from "@/entity";
// import { format } from '@codemirror/formatting';

const customTheme = EditorView.theme({
    '&': {
        fontSize: '18px'
    }
})

export interface ISceneFormProps {
    scene?: Scene
}

export interface ISceneFormData {
    id: number;
    name: string;
    text: string;
    choices: Partial<Choice>[];
    quest: number;
}

function SceneForm({scene}: ISceneFormProps) {
    const {service} = useSceneContext();
    const {questId, sceneId} = useParams();

    const elementRef = useRef(null);

    const [loading, setLoading] = useState(false);

    const methods = useForm<ISceneFormData>({
        defaultValues: {
            id: Number(sceneId),
            name: scene?.name ?? '',
            text: scene?.text ?? "div>ul>li>span",
            choices: scene?.choices ?? [],
            quest: Number(questId)
        }
    });

    const {control, handleSubmit} = methods;

    const {fields, append, remove} = useFieldArray({
        control,
        name: 'choices'
    });

    const onSubmit = async (data: any) => {
        setLoading(true);
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

    const addChoice = () => append({label: "", text: "", nextSceneId: 0});


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

    if (loading) {
        return <div>Saving...</div>
    }

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
                render={({field: {value, onChange}}) => (
                    <TextField
                        id={'scene'}
                        key={'scene'}
                        value={value}
                        onChange={onChange}
                        placeholder={'Scene'}
                        label={'Scene'}
                        size="small"
                    />
                )}
            />

            <Controller
                name="text"
                control={control}
                render={({field: {value, onChange}}) => (
                    <CodeMirror
                        value={value}
                        theme={darcula}
                        extensions={[
                            langs.html(),
                            abbreviationTracker(),
                            customTheme,
                            Prec.highest(
                                keymap.of([
                                    {
                                        key: "Tab", run: expandAbbreviation
                                    }
                                ])
                            )
                        ]}
                        onChange={onChange}
                    />)}
            />

            <Paper>
                <Box py={1} display="flex" justifyContent="end">
                    <Button onClick={addChoice} size="small" variant="contained" startIcon={<Add/>}>
                        Add Choice
                    </Button>
                </Box>
            </Paper>
            <Divider/>
            <Grid container spacing={0.5} columns={{xs: 4, sm: 6, md: 12}}>
                {fields.map((item, index) => (
                    <Grid key={item.id}>
                        <Card variant="outlined">
                            <CardHeader
                                subheader={`Choice ${index + 1}`}
                                action={
                                    <IconButton onClick={() => remove(index)} size="small">
                                        <DeleteIcon fontSize="small"/>
                                    </IconButton>
                                }
                            />
                            <CardContent>
                                <ChoiceForm prefix="choices" index={index}/>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

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
