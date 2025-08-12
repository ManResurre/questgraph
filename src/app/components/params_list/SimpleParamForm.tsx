import React, {useEffect} from "react";
import {Button, Checkbox, FormControl, FormControlLabel, Stack, TextField} from "@mui/material";
import {Controller, useForm} from "react-hook-form";
import {db, Param} from "@/lib/db";
import {useSceneContext} from "@/app/components/scene_list/SceneProvider";

interface PramFormData {
    key: string;
    label: string;
    value: string;
    hide: boolean;
}

export interface SimpleParamFormParams {
    questId: number,
    editedParam: Param | undefined,
}

const SimpleParamForm = ({questId}: SimpleParamFormParams) => {
    const {service} = useSceneContext();

    const {handleSubmit, control, reset} = useForm<PramFormData>({
        defaultValues: {
            key: "",
            label: "",
            value: "",
            hide: true
        }
    });

    useEffect(() => {
        reset(service?.editedParam)
    }, [service?.editedParam])

    const onSubmit = (data: PramFormData) => {
        db.params.put({...data, questId});
        reset({});
        if (service)
            service.editedParam = undefined;
    }

    return <Stack
        p={1}
        spacing={1}
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}>

        <FormControl fullWidth>
            <Controller
                name={`key`}
                control={control}
                render={({field: {value, onChange}}) => (
                    <TextField
                        variant="standard"
                        value={value}
                        onChange={onChange}
                        placeholder={'Key'}
                        label={'Key'}
                        size="small"
                    />
                )}
            />
        </FormControl>

        <FormControl fullWidth>
            <Controller
                name={`label`}
                control={control}
                render={({field: {value, onChange}}) => (
                    <TextField
                        variant="standard"
                        value={value}
                        onChange={onChange}
                        placeholder={'Label'}
                        label={'Label'}
                        size="small"
                    />
                )}
            />
        </FormControl>

        <FormControl fullWidth>
            <Controller
                name={`value`}
                control={control}
                render={({field: {value, onChange}}) => (
                    <TextField
                        variant="standard"
                        value={value}
                        onChange={onChange}
                        placeholder={'Value'}
                        label={'Value'}
                        size="small"
                    />
                )}
            />
        </FormControl>

        <FormControl>
            <Controller
                name="hide"
                control={control}
                defaultValue={true}
                render={({field: {value, onChange}}) => (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={value}
                                onChange={(e) => onChange(e.target.checked)}
                            />
                        }
                        label="Скрыть/Показать"
                    />
                )}
            />
        </FormControl>

        <Button size="small"
                variant="contained"
                type="submit"
                fullWidth
        >Add Param</Button>
    </Stack>
}
export default React.memo(SimpleParamForm);
