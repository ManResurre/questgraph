import {
    Box,
    Button,
    Stack,
    TextField,
    Checkbox,
    FormControlLabel,
    MenuItem,
    FormControl,
    FormLabel
} from "@mui/material";
import React, {useCallback, useEffect, useMemo} from "react";
import {Controller, useForm} from "react-hook-form";
import {useParams} from "next/navigation";
import {Database} from "@/supabase"; // твой сгенерированный тип
import CodeMirror, {EditorView} from "@uiw/react-codemirror";
import {langs} from "@uiw/codemirror-extensions-langs";
import {darcula} from "@uiw/codemirror-theme-darcula";
import {abbreviationTracker, expandAbbreviation} from "@emmetio/codemirror6-plugin";
import {Prec} from "@codemirror/state";
import {keymap} from "@codemirror/view";
import {useParameters} from "@/app/components/parameters/ParametersProvider";
import {formatCode} from "@/lib/CodeMirrorHelper";
import {ParameterInsert, ParameterScene} from "@/lib/ParametersRepository";
import {useSidebar} from "@/app/components/sidebar/graphSidebarProvider";

type ParameterType = Database["public"]["Enums"]["ParameterType"];
const parameterTypes: ParameterType[] = ["value", "calculation", "percent"];

interface EditParameterProps {
    onSubmit?: (p: ParameterInsert, ps: ParameterScene | null) => void,
    patch?: ParameterScene | null
}

const EditParameter = ({onSubmit, patch}: EditParameterProps) => {
    const {questId} = useParams();
    const {
        editingParameter,
        editingParameterScene,
        setEditingParameter,
        upsertParameter
    } = useParameters();

    const {setLoading} = useSidebar();

    const initialValues = useMemo(() => ({
        quest_id: Number(questId),
        label: "",
        value: "",
        key: "",
        text: "",
        hide: false,
        type: "value",
        desc: "",
        ...editingParameter
    }), [questId]);

    const {control, handleSubmit, formState: {errors}, reset} = useForm<ParameterInsert>({
        defaultValues: initialValues as ParameterInsert
    });

    useEffect(() => {
        if (editingParameter)
            reset(editingParameter)

        if (patch && patch.value) {
            console.log(patch);
            reset(JSON.parse(patch.value))
        }

    }, [editingParameter])

    const submit = useCallback(async (data: ParameterInsert) => {
        setLoading(true)

        if (onSubmit) {
            onSubmit(data, editingParameterScene)
        } else {
            await upsertParameter(data as ParameterInsert);
        }

        setLoading(false)
        clear();
    }, [editingParameterScene]);

    const clear = () => {
        reset(initialValues as ParameterInsert);
        setEditingParameter(null);
    }

    return (
        <Stack
            spacing={1}
            component="form"
            noValidate
            autoComplete="off"
            sx={{width: 1}}
            onSubmit={handleSubmit(submit)}
        >
            {/* Label */}
            <Controller
                name="label"
                control={control}
                render={({field}) => (
                    <TextField
                        {...field}
                        label="Label"
                        size="small"
                        error={!!errors.label}
                        helperText={errors.label?.message}
                    />
                )}
            />

            {/* Key */}
            <Controller
                name="key"
                control={control}
                render={({field}) => (
                    <TextField
                        {...field}
                        label="Key"
                        size="small"
                        error={!!errors.key}
                        helperText={errors.key?.message}
                    />
                )}
            />

            {/* Value */}
            <Controller
                name="value"
                control={control}
                render={({field}) => (
                    <TextField
                        {...field}
                        label="Value"
                        size="small"
                        error={!!errors.value}
                        helperText={errors.value?.message}
                    />
                )}
            />

            {/* Text (много текста → CodeMirror) */}
            <Controller
                name="text"
                control={control}
                render={({field: {value, onChange}, fieldState: {error}}) => (
                    <FormControl fullWidth error={!!error}>
                        <FormLabel>Text</FormLabel>
                        <CodeMirror
                            value={value ?? ""}
                            theme={darcula}
                            extensions={[
                                langs.html(),
                                abbreviationTracker(),
                                EditorView.lineWrapping,
                                Prec.highest(
                                    keymap.of([
                                        {key: "Tab", run: expandAbbreviation},
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
                    </FormControl>
                )}
            />

            {/* Desc (много текста → CodeMirror) */}
            <Controller
                name="desc"
                control={control}
                render={({field: {value, onChange}, fieldState: {error}}) => (
                    <FormControl fullWidth error={!!error}>
                        <FormLabel>Description</FormLabel>
                        <CodeMirror
                            value={value ?? ""}
                            theme={darcula}
                            extensions={[
                                langs.json(),
                                abbreviationTracker(),
                                EditorView.lineWrapping,
                                Prec.highest(
                                    keymap.of([
                                        {key: "Tab", run: expandAbbreviation},
                                        {
                                            key: "Ctrl-Alt-l",
                                            run: (view) => {
                                                formatCode(view);
                                                return true;
                                            }
                                        }
                                    ])
                                )
                            ]}
                            onChange={onChange}
                        />
                    </FormControl>
                )}
            />

            {/* Hide */}
            <Controller
                name="hide"
                control={control}
                render={({field}) => (
                    <FormControlLabel
                        control={<Checkbox {...field} checked={!!field.value}/>}
                        label="Hide"
                    />
                )}
            />

            {/* Type */}
            <Controller
                name="type"
                control={control}
                render={({field}) => (
                    <TextField
                        {...field}
                        select
                        label="Type"
                        size="small"
                        error={!!errors.type}
                        helperText={errors.type?.message}
                    >
                        {parameterTypes.map((t) => (
                            <MenuItem key={t} value={t}>
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </MenuItem>
                        ))}
                    </TextField>
                )}
            />

            <Box display="flex" justifyContent="space-between" gap={1}>
                <Button size="small" variant="contained" type="submit" fullWidth>
                    Save
                </Button>
            </Box>
        </Stack>
    );
};

export default React.memo(EditParameter);
