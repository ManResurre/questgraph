import {Controller, useForm} from "react-hook-form";
import {Button, FormControl, Paper, Stack, TextField} from "@mui/material";
import React, {useEffect} from "react";
import {useQuestContext} from "@/app/components/quest_list/QuestsProvider";
import {IQuest} from "@/app/components/quest_list/QuestService";

interface IQuestEditForm extends IQuest {
}

export function QuestEditForm() {
    const {service, update} = useQuestContext();

    const {handleSubmit, control, reset} = useForm<IQuestEditForm>({
        defaultValues: {
            name: ""
        }
    });

    useEffect(() => {
        reset({
            name: service?.edited?.name
        })

    }, [update]);

    const onSubmit = (data: IQuestEditForm) => {
        service?.create<IQuestEditForm>({
            ...service?.edited,
            ...data
        });
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
