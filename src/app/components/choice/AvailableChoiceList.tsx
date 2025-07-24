import {useLiveQuery} from "dexie-react-hooks";
import {Choice, db} from "@/lib/db";
import {useParams} from "next/navigation";
import React from "react";
import {ListItem, List, ListItemText, IconButton, Chip} from "@mui/material";
import ChoiceTextList from "@/app/components/choice/ChoiceTextList";
import {Edit} from "@mui/icons-material";
import CheckIcon from '@mui/icons-material/Check';
import {useSceneContext} from "@/app/components/scene_list/SceneProvider";
import LocationList from "@/app/components/choice/LocationList";

export interface AvailableChoiceListParams {
}

export default function AvailableChoiceList({}: AvailableChoiceListParams) {
    const {service} = useSceneContext();
    const {questId} = useParams();
    const choices = useLiveQuery(() =>
        db.choices.where('questId').equals(Number(questId!)).toArray());

    const handleSelectClick = (choice: Choice) => {
        service?.addChoice(choice);
    }

//.filter((ch) => !ch.sceneId)
    return <List>
        {choices && choices.map((choice) =>
            <ListItem disablePadding key={`choice_${choice.id}`}
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
                    primary={choice.label}
                    secondary={<>
                        <ChoiceTextList choiceId={Number(choice.id)}/>
                        <LocationList choiceId={Number(choice.id)}/>
                    </>}
                    slotProps={
                        {
                            secondary: {
                                component: "div"
                            }
                        }
                    }
                />
            </ListItem>
        )}
    </List>
}