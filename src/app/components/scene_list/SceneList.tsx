'use client'
import React, {useState} from "react";
import {
    Accordion, AccordionSummary,
    AccordionActions, AccordionDetails,
    Box, Button, Card, CardContent, Paper,
    Typography, Toolbar
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import {useSceneContext} from "@/app/components/scene_list/SceneProvider";
import Link from "next/link";
import {useParams} from "next/navigation";
import {Choice, Scene} from "@/entity";

export default function SceneList({scenes}: { scenes: Scene[] }) {
    const {questId} = useParams();
    const {service} = useSceneContext();

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
        <Toolbar sx={{justifyContent: "end"}}>
            <Box sx={{display: {xs: 'none', sm: 'block'}}}>
                <Button href={`${questId}/scene/new`} component={Link}>Create Scene</Button>
            </Box>
        </Toolbar>

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
                    <Card>
                        <CardContent>
                            <ol>
                                {scene.choices.map((ch, index) => {
                                    return <li key={`scene.${scene.name}.choice.${index}`}>
                                        <Button size="small" variant="text">{ch.label}</Button>
                                    </li>
                                })}
                            </ol>
                        </CardContent>
                    </Card>
                </AccordionDetails>
                <AccordionActions>
                    <Button href={`${questId}/scene/${scene.id}/edit`} component={Link}>Edit</Button>
                    <Button onClick={() => handleDelete(scene.id!)}>Delete</Button>
                </AccordionActions>
            </Accordion>
        })}
    </>
}
