import {Controller, useFieldArray, useForm} from "react-hook-form";
import React, {useEffect} from "react";
import {Box, Button, Grid, Paper, Stack, TextField} from "@mui/material";
import {Add} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import {ParamValue} from "./IParamsView";
import {useParams} from "./ParamsProvider";

const emptyValue: ParamValue = {min: 0, max: 0, str: ''};

function RangeValues() {
    const {params} = useParams();
    if (!params) {
        throw new Error('Please provide Params!')
    }

    const selectedParam = params.getSelected();

    const {control, handleSubmit, reset} = useForm<{ values: ParamValue[] }>();

    const {fields, remove, append} = useFieldArray({
        control,
        name: `values`
    });

    useEffect(() => {
        if (!selectedParam || !selectedParam.values) {
            reset({values: []});
            return;
        }

        reset({values: selectedParam.values});
    }, [selectedParam]);

    const addValueRange = () => {
        append(emptyValue);
    }

    const onSubmit = ({values}: { values: ParamValue[] }) => {
        params.setValues(values);
    }

    return <Stack
        component="form"
        noValidate
        autoComplete="off"
        spacing={1}
        onSubmit={handleSubmit(onSubmit)}
    >
        <Paper sx={{
            backgroundColor: "#30374180"
        }}>
            <Box p={0.5} display="flex" justifyContent="end">
                <Button onClick={addValueRange} size="small" variant="contained" startIcon={<Add/>}>
                    Add Value Range
                </Button>
            </Box>
        </Paper>

        {(fields.map((item, index) => {
            return <Grid key={item.id} container spacing={2}>
                <Grid size={4}>
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
                </Grid>
                <Grid size={4}>
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
                </Grid>
                <Grid size={4}>
                    <Box display="flex" justifyContent="center" alignItems="center">
                        <Controller
                            name={`values.${index}.str`}
                            control={control}
                            render={({field: {value, onChange}}) => (
                                <TextField
                                    fullWidth
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
                    </Box>
                </Grid>
            </Grid>
        }))}
        <Button size="small" variant="contained" type="submit">Save</Button>
    </Stack>
}

export default RangeValues;
