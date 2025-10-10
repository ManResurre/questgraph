import React, {useEffect, useMemo} from "react";
import {Controller, useForm} from "react-hook-form";
import {Choice} from "@/lib/db";
import {useParams} from "next/navigation";
import {Box, Button, IconButton, Stack, TextField} from "@mui/material";
import {saveChoice} from "@/lib/ChoiceRepository";
import ClearIcon from '@mui/icons-material/Clear';

interface NewChoiceProps {
    editing?: Choice | undefined
}

const NewChoice = ({editing}: NewChoiceProps) => {
    const {questId} = useParams();

    const initialValues = useMemo(() => ({
        id: undefined,
        questId: Number(questId!),
        label: '',
        text: '',
        nextSceneId: undefined,
    }), [questId])

    const {control, formState: {errors}, handleSubmit, reset} = useForm<Choice>({
        defaultValues: initialValues
    })

    useEffect(() => {
        if (!editing)
            return;
        reset(editing);
    }, [editing])

    const onSubmit = (data: Choice) => {
        saveChoice(data);
    }

    const handleClear = () => {
        reset(initialValues);
    }

    return <Stack
        spacing={1}
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
    >
        <Controller
            name="label"
            control={control}
            rules={{
                required: "Поле обязательно для заполнения"
            }}
            render={({field: {value, onChange}}) => (
                <TextField
                    required
                    id={'label'}
                    key={'label'}
                    value={value}
                    onChange={onChange}
                    placeholder={'Label'}
                    label={'Label'}
                    size="small"
                    error={!!errors.label}
                    helperText={errors.label?.message}
                />
            )}
        />

        <Controller
            name="text"
            control={control}
            rules={{
                required: "Поле обязательно для заполнения"
            }}
            render={({field: {value, onChange}}) => (
                <TextField
                    required
                    id={'text'}
                    key={'text'}
                    value={value}
                    onChange={onChange}
                    placeholder={'Text'}
                    label={'Text'}
                    size="small"
                    error={!!errors.text}
                    helperText={errors.text?.message}
                />
            )}
        />

        <Box display="flex" justifyContent="space-between" gap={1}>
            <Button size="small"
                     variant="contained"
                     type="submit"
                     fullWidth
        >Save</Button>

            <IconButton onClick={() => handleClear()}><ClearIcon/></IconButton>
        </Box>
    </Stack>
}

export default React.memo(NewChoice);
