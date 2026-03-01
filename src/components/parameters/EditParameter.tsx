import React, {useEffect, useMemo} from "react";
import {useParams} from "@tanstack/react-router";
import {Controller, useForm} from "react-hook-form";

import {
    ParameterInsert,
    ParameterScene,
    ParameterType,
} from "@/lib/ParametersRepository";
import {useParameters} from "@/components/parameters/ParametersProvider";
import {useSidebar} from "@/components/sidebar/graphSidebarProvider";
import {questIdRoute} from "@/routes/quests";
import {useParameterEditStrategy} from "@/hooks/useParameterEditStrategy";
import {
    Box,
    Button,
    Stack,
    TextField,
    Checkbox,
    FormControlLabel,
    MenuItem,
    FormControl,
    FormLabel,
} from "@mui/material";

import CMEditor from "@/components/cm/CMEditor.tsx";

const parameterTypes: ParameterType[] = [
    "value",
    "calculation",
    "percent",
    "range",
];

interface EditParameterProps {
    onSubmit?: (p: ParameterInsert, ps: ParameterScene | null) => void;
    patch?: ParameterScene | null;
}

const EditParameter = ({patch}: EditParameterProps) => {
    const {id: questId} = useParams({from: questIdRoute.id});

    const {
        editingParameter,
    } = useParameters();

    const initialValues = useMemo(() => (
        {
            quest_id: Number(questId),
            label: "",
            value: "",
            key: "",
            text: "",
            hide: false,
            type: "value" as const,
            desc: "",
        }
    ), [questId]);

    const {
        handleSubmit: submit,
    } = useParameterEditStrategy();

    const {control, handleSubmit, reset} = useForm<ParameterInsert>({
        defaultValues: initialValues as ParameterInsert,
    });

    useEffect(() => {
        if (!editingParameter) {
            reset(initialValues)
            return;
        }

        reset(editingParameter)
    }, [editingParameter]);

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
                        fullWidth
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
                        fullWidth
                    />
                )}
            />

            {/* Value */}
            <Controller
                name="value"
                control={control}
                render={({field, fieldState: {error}}) => {
                    // Для доступа к type используем контекст формы через useWatch
                    return (
                        <FormControl fullWidth error={!!error}>
                            <FormLabel>Value</FormLabel>
                            <CMEditor
                                value={field.value ?? ""}
                                onChange={field.onChange}
                                lang="json"
                            />
                        </FormControl>
                    );
                }}
            />

            {/* Text (много текста → CodeMirror) */}
            <Controller
                name="text"
                control={control}
                render={({field, fieldState: {error}}) => (
                    <FormControl fullWidth error={!!error}>
                        <FormLabel>Text</FormLabel>
                        <CMEditor
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            lang="html"
                        />
                    </FormControl>
                )}
            />

            {/* Desc (много текста → CodeMirror) */}
            <Controller
                name="desc"
                control={control}
                render={({field, fieldState: {error}}) => (
                    <FormControl fullWidth error={!!error}>
                        <FormLabel>Description</FormLabel>
                        <CMEditor
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            lang="json"
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
                        control={
                            <Checkbox {...field} checked={!!field.value}/>
                        }
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
                        fullWidth
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
                <Button
                    size="small"
                    variant="contained"
                    type="submit"
                    fullWidth
                >
                    Save
                </Button>
            </Box>
        </Stack>
    );
};

export default EditParameter;
