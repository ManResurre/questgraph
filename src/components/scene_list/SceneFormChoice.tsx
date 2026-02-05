import {Box, Button, Card, CardContent, CardHeader, Divider, Grid, Paper} from "@mui/material";
import {Add} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import ChoiceForm from "@/app/components/choice/ChoiceForm";
import React from "react";
import {useFieldArray} from "react-hook-form";

export default function SceneFormChoice({methods}: any) {
    const {fields, append, remove} = useFieldArray({
        control: methods.control,
        name: 'choices'
    });

    const addChoice = () => append({label: "", text: "", nextSceneId: 0});

    return <>
        <Paper>
            <Box py={1} display="flex" justifyContent="end">
                <Button onClick={addChoice} size="small" variant="contained" startIcon={<Add/>}>
                    Add Choice
                </Button>
            </Box>
        </Paper>
        <Divider/>
        <Grid container spacing={0.5} columns={{xs: 4, sm: 6, md: 12}}>
            {fields.map((item, index) => (
                <Grid key={item.id}>
                    <Card variant="outlined">
                        <CardHeader
                            subheader={`Choice ${index + 1}`}
                            action={
                                <IconButton onClick={() => remove(index)} size="small">
                                    <DeleteIcon fontSize="small"/>
                                </IconButton>
                            }
                        />
                        <CardContent>
                            <ChoiceForm prefix="choices" index={index}/>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    </>
}