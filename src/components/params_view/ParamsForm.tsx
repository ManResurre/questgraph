'use client'
import {
    Box,
    Button, Chip,
    FormControl, Grid,
    Paper, Radio,
    Stack,
    TextField,
} from "@mui/material";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import React, {useEffect} from "react";
import {Add} from "@mui/icons-material";
import ValuesView from "./ValuesView";
import {ParamRaw, PramsFormData} from "../../GraphFormInterfaces";
import {useParams} from "./ParamsProvider";
import {Param} from "@/app/IParamsView";


const newEmptyParam: ParamRaw = {
    key: "", label: ""
}

function ParamsForm() {
    const {params, update} = useParams();

    const methods = useForm<PramsFormData>({
        defaultValues: {
            params: params?.toObjects()
        }
    });

    const {control, handleSubmit, getValues, reset} = methods;

    const {fields, append} = useFieldArray({
        control: control,
        name: 'params'
    });

    useEffect(() => {
        if (!update)
            return;
        reset({params: params?.toObjects()});
    }, [update]);

    const onSubmit = (data: PramsFormData) => {
        params?.fromObjects(data.params);
    }

    const addParam = () => append({...newEmptyParam});

    const handleSelectRow = (index: number) => {
        return () => {
            params?.selectParam(getValues('params')[index].key!);
        }
    }

    function isSelected(index: number) {
        return getValues('params')[index].key === params?.getSelectedKey();
    }

    return <Box display="flex">
        <Paper sx={{
            backgroundColor: "#30374180",
            resize: "horizontal",
            overflow: "auto",
        }}>
            <Box p={0.5} display="flex" justifyContent="end">
                <Button onClick={addParam} size="small" variant="contained" startIcon={<Add/>}>
                    Add Param
                </Button>
            </Box>
            <Stack
                p={1}
                spacing={1}
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit(onSubmit)}>
                {fields.map((item: Param, index) => (
                    <Stack key={item.id} direction="row" alignItems="center" spacing={1}>
                        <Chip label={index + 1}/>
                        <Radio
                            checked={isSelected(index)}
                            onClick={handleSelectRow(index)}
                        />
                        <FormControl fullWidth>
                            <Controller
                                name={`params.${index}.key`}
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
                                name={`params.${index}.label`}
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
                    </Stack>
                ))}
                <Button size="small" variant="contained" type="submit">Save</Button>
            </Stack>
        </Paper>
        <Grid size={6}>
            {params?.getSelected() &&
                <Paper>
                    <Box p={1}>
                        <ValuesView/>
                    </Box>
                </Paper>
            }
        </Grid>
    </Box>
}

export default ParamsForm;
