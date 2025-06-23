'use client'
import React, {useState} from "react";
import {
    Accordion, AccordionSummary,
    AccordionActions, AccordionDetails,
    Box, Button, Card, CardContent, Paper,
    Typography, Toolbar, ListItemText, ListItemButton,
    List
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import Link from "next/link";
import {useParams} from "next/navigation";
import {Choice, Scene} from "@/lib/db";
import ChoiceList from "@/app/components/choice/ChoiceList";

export default function SceneList({scenes}: { scenes: Scene[] }) {
    const {questId} = useParams();
    // const {service} = useSceneContext();

    const [selectedScene, setSelectedScene] = useState(Number(localStorage.getItem('selected_scene')) || 1);
    const handleExpansion = (id: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
        if (isExpanded) {
            setSelectedScene(id);
            localStorage.setItem('selected_scene', String(id));
        }
    };

    const handleEdit = (sceneId: number) => {
        // if (onChangeScene) {
        //     onChangeScene(sceneId);
        // }
    }

    const handleDelete = (id: number) => {
        // const qgs = new QuestGraphsService();
        // void qgs.delete(id);
    }

    return <>
        <Box pb={1}>
            <Paper>
                <List disablePadding>
                    <ListItemButton href={`${questId}/scene/new`} component={Link}>
                        <ListItemText sx={{textAlign: "center"}} primary="Add Scene"/>
                    </ListItemButton>
                </List>
            </Paper>
        </Box>

        {scenes.map((scene) => {
            return <Accordion
                expanded={selectedScene === scene.id!}
                onChange={handleExpansion(scene.id!)}
                key={`${scene.name}${scene.id}`}>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon/>}
                    aria-controls="panel3-content"
                >
                    <Typography component="h6">{scene.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Paper variant="outlined">
                        <Box p={1}>
                            {/*<QuestMainText text={scene.text}/>*/}
                            {scene.text}
                        </Box>
                    </Paper>
                    <ChoiceList scene={scene}/>

                </AccordionDetails>
                <AccordionActions>
                    <Button href={`${questId}/scene/${scene.id}/edit`} component={Link}>Edit</Button>
                    <Button onClick={() => handleDelete(scene.id!)}>Delete</Button>
                </AccordionActions>
            </Accordion>
        })}
    </>
}
