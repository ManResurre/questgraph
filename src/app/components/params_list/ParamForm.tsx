'use client'
import {Param} from "@/app/IParamsView";
import {
    Box,
    Button, Checkbox,
    Chip, Divider,
    FormControl,
    FormControlLabel,
    FormLabel, Paper,
    Radio,
    RadioGroup,
    Stack,
    TextField
} from "@mui/material";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import React from "react";
import {PramsFormData} from "@/app/GraphFormInterfaces";
import {Add} from "@mui/icons-material";
import {ParamValue} from "@/app/components/params_view/IParamsView";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

export type ParamType = "regular" | "failed" | "successful" | "fatal";

interface PramFormData {
    key: string;
    label: string;
    options: {
        type: ParamType,
        show: boolean,
        borderMax: boolean,
        startValue: number,
        description: string,
    },
    values: {
        min: number,
        max: number,
        str: string
    }[]
}

const emptyValue: ParamValue = {min: 0, max: 0, str: ''};

export default function ParamForm() {
    const {handleSubmit, control} = useForm<PramFormData>({
        defaultValues: {
            key: "",
            label: "",
            options: {
                type: "regular" as const,
                show: false,
                borderMax: true,
                startValue: 0,
                description: "",
            },
            values: []
        }
    });

    const {fields, remove, append} = useFieldArray({
        control,
        name: `values`
    });

    const addValueRange = () => {
        append(emptyValue);
    }

    const onSubmit = (data: PramFormData) => {
        console.log(data);
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

        <Divider/>

        <FormControl>
            <FormLabel>Type</FormLabel>
            <Controller
                name="options.type"
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
                name="options.show"
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
                name="options.borderMax"
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
                name="options.startValue"
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
                name="options.description"
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

        <Divider/>

        <Paper sx={{
            backgroundColor: "#30374180"
        }}>
            <Box p={0.5} display="flex" justifyContent="end">
                <Button onClick={addValueRange} size="small" variant="contained" startIcon={<Add/>}>
                    Add Value Range
                </Button>
            </Box>
        </Paper>
        {fields.map((item, index) =>
            <Box key={item.id} display={"flex"} justifyContent={"center"} alignItems={"center"}>
                <Controller
                    name={`values.${index}.min`}
                    control={control}
                    render={({field: {value, onChange}}) => (
                        <TextField
                            variant="standard"
                            value={value}
                            onChange={onChange}
                            placeholder={'Min'}
                            label={'Min'}
                            size="small"
                        />
                    )}
                />

                <Controller
                    name={`values.${index}.max`}
                    control={control}
                    render={({field: {value, onChange}}) => (
                        <TextField
                            variant="standard"
                            value={value}
                            onChange={onChange}
                            placeholder={'Max'}
                            label={'Max'}
                            size="small"
                        />
                    )}
                />
                <Controller
                    name={`values.${index}.str`}
                    control={control}
                    render={({field: {value, onChange}}) => (
                        <TextField
                            // fullWidth
                            variant="standard"
                            value={value}
                            onChange={onChange}
                            placeholder={'String'}
                            label={'String'}
                            size="small"
                        />
                    )}
                />
                <Box>
                    <IconButton onClick={() => remove(index)} size="small">
                        <DeleteIcon fontSize="small"/>
                    </IconButton>
                </Box>
            </Box>)}


        <Button size="small"
                variant="contained"
                type="submit"
                fullWidth
        >Save</Button>
    </Stack>
}
