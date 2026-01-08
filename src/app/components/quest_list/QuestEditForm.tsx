import {Controller, useForm} from "react-hook-form";
import {Button, FormControl, Paper, Stack, TextField} from "@mui/material";
import React from "react";
import {Quest} from "@/lib/db";
import {createQuest} from "@/lib/QuestRepository";
import {useQueryClient} from "@tanstack/react-query";
import {User} from "@supabase/supabase-js";

interface QuestEditFormProps {
    user: User
}

export function QuestEditForm({user}: QuestEditFormProps) {
    const {handleSubmit, control, reset} = useForm<Quest>({
        defaultValues: {
            name: ""
        }
    });
    const queryClient = useQueryClient();

    const onSubmit = async (quest: Quest) => {
        reset();
        await createQuest({...quest, user_id: user.id});
        await queryClient.invalidateQueries({queryKey: ["quests"]});
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
