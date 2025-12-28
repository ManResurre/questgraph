import React, {useCallback, useEffect} from "react";
import {Box, Button, IconButton, List, ListItemButton, ListItemText, Paper, Stack, TextField} from "@mui/material";
import {setNextSceneId, updateChoice} from "@/lib/ChoiceRepository";
import DeleteIcon from "@mui/icons-material/Delete";
import {useSidebar} from "@/app/components/sidebar/graphSidebarProvider";
import {useChoice} from "@/app/hooks/choice";
import {useQueryClient} from "@tanstack/react-query";
import {Controller, useForm} from "react-hook-form";
import CodeMirror, {EditorView} from "@uiw/react-codemirror";
import {darcula} from "@uiw/codemirror-theme-darcula";
import {langs} from "@uiw/codemirror-extensions-langs";
import {abbreviationTracker, expandAbbreviation} from "@emmetio/codemirror6-plugin";
import {Prec} from "@codemirror/state";
import {keymap} from "@codemirror/view";
import CheckIcon from "@mui/icons-material/Check";
import {Database} from "@/supabase";
import {formatCode} from "@/lib/CodeMirrorHelper";

type Choice = Database["public"]["Tables"]["choice"]["Row"];

const customTheme = EditorView.theme({
    '&': {
        fontSize: '18px'
    }
})

interface EdgeEditProps {
    selectedChoiceId: number
}

const EdgeEdit = ({selectedChoiceId}: EdgeEditProps) => {
    const {closeSidebar, setLoading} = useSidebar();
    const {data: choice} = useChoice(selectedChoiceId);
    const queryClient = useQueryClient();

    const {handleSubmit, control, formState: {errors}, reset, getValues} = useForm<Choice>({
        defaultValues: {
            transition_text: choice?.transition_text ?? ""
        }
    });

    useEffect(() => {
        if (choice?.transition_text)
            reset({transition_text: choice.transition_text})
    }, [choice])

    const handleRemove = useCallback(async () => {
        await setNextSceneId(selectedChoiceId);
        await queryClient.invalidateQueries({queryKey: ["scenesWithChoices"]});
        closeSidebar();
    }, [])

    const onSubmit = useCallback(async (choiceForm: Choice) => {
        await handleApply();
        closeSidebar();
    }, [choice]);

    const handleApply = useCallback(async () => {
        setLoading(true);
        await updateChoice({
            ...choice,
            ...getValues(),
        } as Choice)
        setLoading(false);
    }, [choice])

    return <Box
        className="py-2 px-1"
        sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
        }}>
        <Box p={1} sx={{width: 1}}>
            {choice && <Paper className="p-1 mb-1">
                {choice.text}
            </Paper>}

            <Stack
                spacing={1}
                component="form"
                noValidate
                autoComplete="off"
                sx={{width: 1}}
                onSubmit={handleSubmit(onSubmit)}
            >
                {/*<Controller*/}
                {/*    name="transition_text"*/}
                {/*    control={control}*/}
                {/*    rules={{*/}
                {/*        required: "Field is required"*/}
                {/*    }}*/}
                {/*    render={({field: {value, onChange}}) => (*/}
                {/*        <TextField*/}
                {/*            required*/}
                {/*            id={'choice'}*/}
                {/*            key={'choice'}*/}
                {/*            value={value}*/}
                {/*            onChange={onChange}*/}
                {/*            placeholder={'Choice'}*/}
                {/*            label={'Choice'}*/}
                {/*            size="small"*/}
                {/*            error={!!errors.transition_text}*/}
                {/*            helperText={errors.transition_text?.message}*/}
                {/*        />*/}
                {/*    )}*/}
                {/*/>*/}

                <Controller
                    name="transition_text"
                    control={control}
                    render={({field: {value, onChange}}) => (
                        <CodeMirror
                            value={value}
                            theme={darcula}
                            minHeight="100px"
                            extensions={[
                                langs.html(),
                                abbreviationTracker(),
                                customTheme,
                                EditorView.lineWrapping,
                                Prec.highest(
                                    keymap.of([
                                        {
                                            key: "Tab", run: expandAbbreviation
                                        },
                                        {
                                            key: "Ctrl-Alt-l",
                                            run: (view) => {
                                                formatCode(view, 'html');
                                                return true;
                                            }
                                        }
                                    ])
                                )
                            ]}
                            onChange={onChange}
                        />
                    )}
                />

                <Box display="flex" justifyContent="space-between" gap={1}>
                    <Button size="small"
                            variant="contained"
                            type="submit"
                            fullWidth
                    >Save</Button>

                    <IconButton onClick={handleApply}><CheckIcon/></IconButton>
                </Box>
            </Stack>
        </Box>

        <IconButton onClick={handleRemove}>
            <DeleteIcon/>
        </IconButton>
    </Box>
}

export default React.memo(EdgeEdit);
