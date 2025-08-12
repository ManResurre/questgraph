import {AccordionDetails, Box, Paper, Tab, Tabs, Typography} from "@mui/material";
import SceneTextList from "@/app/components/scene_list/SceneTextList";
import ChoiceSceneList from "@/app/components/choice/ChoiceSceneList";
import React, {useState} from "react";
import {Scene} from "@/lib/db";
import SceneParams from "@/app/components/scene_list/SceneParams";

interface SceneAccordionDetailsParams {
    scene: Scene;
}

const SceneAccordionDetails = ({scene}: SceneAccordionDetailsParams) => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: any, newValue: number) => {
        setTabValue(newValue);
    };
    return <AccordionDetails>
        <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
        >
            <Tab label="Основное"/>
            <Tab label="Параметры"/>
        </Tabs>
        {tabValue === 0 && (
            <Paper variant="outlined">
                <Box p={1}>
                    {/*<QuestMainText text={scene.text}/>*/}
                    <SceneTextList scene={scene}></SceneTextList>
                </Box>
            </Paper>
        )}
        {tabValue === 1 && (
            <SceneParams scene={scene} />
        )}
        <ChoiceSceneList scene={scene}/>
    </AccordionDetails>
}

export default React.memo(SceneAccordionDetails);
