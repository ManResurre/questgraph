import React, {useEffect} from "react";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    Stack, TextField,
} from "@mui/material";
import {Controller, useForm} from "react-hook-form";
import {useParams} from "./ParamsProvider";
import {OptionsFormData} from "./IParamsView";

const initialValues = {
    type: "regular" as const,
    show: true,
    borderMax: true,
    startValue: "0",
    description: "",
}

function MainOptions() {
    const {params} = useParams();
    if (!params) {
        throw new Error('Please provide Params!')
    }

    const selectedParam = params.getSelected();

    const {handleSubmit, control, reset} = useForm<OptionsFormData>({
        defaultValues: {
            ...initialValues,
            ...selectedParam?.options
        }
    })

    useEffect(() => {
        if (!selectedParam || !selectedParam?.options) {
            reset(initialValues);
            return;
        }

        reset(selectedParam?.options);
    }, [selectedParam]);

    const onSubmit = (options: OptionsFormData) => {
        params.setOptions(options);
    }

    return <Stack
        component="form"
        noValidate
        autoComplete="off"
        spacing={1}
        onSubmit={handleSubmit(onSubmit)}
    >
        <FormControl>
            <FormLabel>Type</FormLabel>
            <Controller
                name="type"
                control={control}
                defaultValue="regular"
                render={({field: {value, onChange}}) => (
                    <RadioGroup value={value} onChange={onChange}>
                        <Stack direction="row">
                            <FormControlLabel value="regular" control={<Radio/>} label="Обычный"/>
                            <FormControlLabel value="failed" control={<Radio/>} label="Провальный"/>
                            <FormControlLabel value="successful" control={<Radio/>} label="Успешный"/>
                            <FormControlLabel value="fatal" control={<Radio/>} label="Смертельный"/>
                        </Stack>
                    </RadioGroup>
                )}
            />
        </FormControl>
        <FormControl>
            <Controller
                name="show"
                control={control}
                defaultValue={false}
                render={({field: {value, onChange}}) => (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={value}
                                onChange={(e) => onChange(e.target.checked)}
                            />
                        }
                        label="Показывать при нуле"
                    />
                )}
            />
        </FormControl>

        <FormControl>
            <Controller
                name="borderMax"
                control={control}
                defaultValue={false}
                render={({field: {value, onChange}}) => (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={value}
                                onChange={(e) => onChange(e.target.checked)}
                            />
                        }
                        label="Критическим является максимум?"
                    />
                )}
            />
        </FormControl>

        <FormControl>
            <Controller
                name="startValue"
                control={control}
                render={({field: {value, onChange}}) => (
                    <TextField
                        variant="outlined"
                        value={value}
                        onChange={onChange}
                        placeholder={'Start Value'}
                        label={'Start Value'}
                        size="small"
                    />
                )}
            />
        </FormControl>

        <FormControl>
            <Controller
                name="description"
                control={control}
                render={({field: {value, onChange}}) => (
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        variant="outlined"
                        value={value}
                        onChange={onChange}
                        placeholder={'Description'}
                        label={'Description'}
                        size="small"
                    />
                )}
            />
        </FormControl>


        <Button size="small" variant="contained" type="submit">Save</Button>
    </Stack>
}

export default MainOptions;
