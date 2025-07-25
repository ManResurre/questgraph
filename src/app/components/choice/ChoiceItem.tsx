import React, {useCallback, useMemo} from "react";
import {useSceneContext} from "@/app/components/scene_list/SceneProvider";
import LocationList from "@/app/components/choice/LocationList";
import {Choice} from "@/lib/db";
import {IconButton, ListItem, ListItemText, Stack, Typography} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ScenesAutocomplete from "@/app/components/choice/ScenesAutocomplete";

const ChoiceItem = React.memo(({choice, scenes, highlight}: any) => {
    const {service} = useSceneContext();
    const locationList = useMemo(() => (
        <LocationList choiceId={choice.id}/>
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

    return (
        <ListItem
            secondaryAction={
                <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleSelectClick(choice);
                    }}
                    sx={{mr: 0.5}}
                >
                    <CheckIcon color={false ? "success" : "primary"} fontSize="small"/>
                </IconButton>
            }
        >
            <ListItemText
                primary={highlightText(choice.label)}
                secondary={<Stack alignItems="flex-start" spacing={1}>
                    <Typography component={'div'}>{highlightText(choice.text)}</Typography>
                    {locationList}
                    <ScenesAutocomplete choice={choice} scenes={scenes}/>
                </Stack>}
                slotProps={
                    {
                        secondary: {
                            component: "div"
                        }
                    }
                }
            />
        </ListItem>
    )
});

export default React.memo(ChoiceItem);
