import React, {useCallback, useMemo} from "react";
import {useSceneContext} from "@/app/components/scene_list/SceneProvider";
import LocationList from "@/app/components/choice/LocationList";
import {Choice, Scene} from "@/lib/db";
import {
    Accordion, AccordionActions,
    AccordionDetails,
    AccordionSummary, Box, Button,
    IconButton,
    ListItem,
    ListItemText, Paper,
    Stack,
    Typography
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ScenesAutocomplete from "@/app/components/choice/ScenesAutocomplete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export interface ChoiceItemAccordionParams {
    choice: Choice;
    scenes: Scene[];
    highlight: string;
    onExpansion: (id: number) => (event: React.SyntheticEvent, isExpanded: boolean) => void;
    selected: number;
}

const ChoiceItemAccordion = (
    {
        choice,
        scenes,
        highlight,
        onExpansion,
        selected
    }: ChoiceItemAccordionParams) => {
    const {service} = useSceneContext();
    const locationList = useMemo(() => (
        <LocationList choiceId={choice.id!}/>
    ), [choice.id]);

    const highlightText = (text: string) => {
        if (!highlight || !text) return text;

        const regex = new RegExp(`(${highlight})`, "gi");
        const parts = text.split(regex);

        return parts.map((part, i) =>
            part.toLowerCase() === highlight.toLowerCase() ?
                <mark key={i} style={{backgroundColor: "#ffeb3b"}}>{part}</mark> :
                part
        );
    };

    const handleSelectClick = useCallback((choice: Choice) => {
        service?.addChoice(choice);
    }, [service]);

    const handleDelete = (id: number) => {

    }

    return (
        <Accordion
            expanded={selected === choice.id!}
            onChange={onExpansion(choice.id!)}
            key={`${choice.label}${choice.id}`}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon/>}
                aria-controls="panel3-content"
            >
                <div>
                    <Typography component="p" style={{margin: 0}}>{highlightText(choice.label)}</Typography>
                    <Typography component="p" style={{margin: 0, fontSize: '0.9em', color: 'gray'}}>
                        {highlightText(choice.text)}
                    </Typography>
                </div>
            </AccordionSummary>
            <AccordionDetails>
                <Stack alignItems="flex-start" spacing={1}>
                    From:{locationList}
                    To:<ScenesAutocomplete choice={choice} scenes={scenes}/>
                </Stack>
            </AccordionDetails>
            <AccordionActions>
                {/*<Button href={`${questId}/scene/${scene.id}/edit`} component={Link}>Edit</Button>*/}
                <Button onClick={() => handleSelectClick(choice)}>Select</Button>
                <Button onClick={() => handleDelete(choice.id!)}>Delete</Button>
            </AccordionActions>
        </Accordion>
    )
};

export default React.memo(ChoiceItemAccordion);
