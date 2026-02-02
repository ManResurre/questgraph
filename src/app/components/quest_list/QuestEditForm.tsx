import {Controller, useForm} from "react-hook-form";
import {Button, FormControl, Paper, Stack, TextField} from "@mui/material";
import React, {useEffect} from "react";
import {Quest} from "@/lib/QuestRepository";
import {User} from "@supabase/supabase-js";
import {useQuests} from "@/app/components/quest/QuestContext";

interface QuestEditFormProps {
    user: User
}

export function QuestEditForm({user}: QuestEditFormProps) {
    const {editingQuest, upsertQuest, editQuest} = useQuests();

    const {handleSubmit, control, reset, formState: {errors}} = useForm<Quest>({
        defaultValues: {
            name: '',
            ...editingQuest
        }
    });

    const onSubmit = async (quest: Quest) => {
        await upsertQuest({...quest, user_id: user.id});
        editQuest(null);
    }

    useEffect(() => {
        if (editingQuest) {
            reset(editingQuest);
            return;
        }

        reset({name:""});
    }, [editingQuest])

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
                    rules={{
                        required: "Название Квеста обязательно"
                    }}
                    render={({field: {value, onChange}}) => (
                        <TextField
                            required
                            variant="standard"
                            value={value}
                            onChange={onChange}
                            placeholder={'Name'}
                            label={'Name'}
                            size="small"
                            error={!!errors.name}
                            helperText={errors.name?.message}
                        />
                    )}
                />
            </FormControl>
            <Button size="small" variant="contained" type="submit">Save</Button>
        </Stack>
    </Paper>
}
