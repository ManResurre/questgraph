import {Controller, useForm} from "react-hook-form";
import {Button, FormControl, Paper, Stack, TextField} from "@mui/material";
import React from "react";
import {Quest} from "@/lib/db";
import {createQuest} from "@/lib/QuestRepository";
import supabase from "@/supabaseClient";
import {QueryObserverResult, RefetchOptions} from "@tanstack/react-query";

interface QuestEditFormProps {
    refetch?: (
        options?: RefetchOptions
    ) => Promise<QueryObserverResult<Quest[] | null, Error>>;
}

export function QuestEditForm({refetch}: QuestEditFormProps) {
    const {handleSubmit, control, reset} = useForm<Quest>({
        defaultValues: {
            name: ""
        }
    });

    const onSubmit = async (quest: Quest) => {
        const {data: {user}} = await supabase.auth.getUser();
        if (!user) {
            return;
        }

        await createQuest({...quest, user_id: user?.id});
        reset();
        if (refetch)
            refetch();
    }

    return <Paper>
        <Stack
            p={1}
            spacing={1}
            component="form"
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit(onSubmit)}>
            <FormControl fullWidth>
                <Controller
                    name={`name`}
                    control={control}
                    render={({field: {value, onChange}}) => (
                        <TextField
                            variant="standard"
                            value={value}
                            onChange={onChange}
                            placeholder={'Name'}
                            label={'Name'}
                            size="small"
                        />
                    )}
                />
            </FormControl>
            <Button size="small" variant="contained" type="submit">Save</Button>
        </Stack>
    </Paper>
}
