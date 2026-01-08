import React, { useEffect, useCallback } from "react";
import {
    Box,
    Button,
    IconButton,
    Stack,
    TextField,
    Paper
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import { useForm, Controller } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { useSidebar } from "@/app/components/sidebar/graphSidebarProvider";
import { Database } from "@/supabase";
import {
    updateParameterChoice,
    deleteParameterChoice
} from "@/lib/ParametersRepository";
import {useParameterChoice} from "@/app/hooks/parameters";

type ParameterChoice = Database["public"]["Tables"]["parameter_choice"]["Row"];

interface ParameterChoiceEditProps {
    data: any;
}

const ParameterChoiceEdit = ({ data }: ParameterChoiceEditProps) => {
    const choiceId = parseInt(data.source);

    const { closeSidebar, setLoading } = useSidebar();
    const { data: paramChoice } = useParameterChoice(choiceId);
    const queryClient = useQueryClient();

    const {
        handleSubmit,
        control,
        reset,
        getValues
    } = useForm<ParameterChoice>({
        defaultValues: {
            value: paramChoice?.value ?? ""
        }
    });

    useEffect(() => {
        if (paramChoice?.value) {
            reset({ value: paramChoice.value });
        }
    }, [paramChoice]);

    const handleRemove = useCallback(async () => {
        await deleteParameterChoice(choiceId);
        await queryClient.invalidateQueries({ queryKey: ["parameter_choices"] });
        closeSidebar();
    }, [choiceId]);

    const handleApply = useCallback(async () => {
        setLoading(true);
        await updateParameterChoice({
            ...paramChoice,
            ...getValues()
        } as ParameterChoice);
        setLoading(false);
    }, [paramChoice]);

    const onSubmit = useCallback(async () => {
        await handleApply();
        closeSidebar();
    }, [handleApply]);

    return (
        <Box p={2}>
            {paramChoice && (
                <Paper className="p-1 mb-1">
                    <strong>Choice ID:</strong> {paramChoice.choice_id} <br />
                    <strong>Param ID:</strong> {paramChoice.param_id}
                </Paper>
            )}

            <Stack
                spacing={2}
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                autoComplete="off"
            >
                <Controller
                    name="value"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            label="Value"
                            fullWidth
                            multiline
                            minRows={3}
                            {...field}
                        />
                    )}
                />

                <Box display="flex" justifyContent="space-between" gap={1}>
                    <Button type="submit" variant="contained" fullWidth>
                        Save
                    </Button>
                    <IconButton onClick={handleApply}>
                        <CheckIcon />
                    </IconButton>
                </Box>
            </Stack>

            <IconButton onClick={handleRemove}>
                <DeleteIcon />
            </IconButton>
        </Box>
    );
};

export default React.memo(ParameterChoiceEdit);
