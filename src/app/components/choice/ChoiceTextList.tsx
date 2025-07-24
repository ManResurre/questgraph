import {useLiveQuery} from "dexie-react-hooks";
import {db} from "@/lib/db";
import React from "react";
import {ListItem, List} from "@mui/material";

interface ChoiceTextListParams {
    choiceId: number
}

export default function ChoiceTextList({choiceId}: ChoiceTextListParams) {
    const choiceTexts = useLiveQuery(() =>
        db.choice_texts.where('choiceId').equals(choiceId).toArray());

    return <List component="ol" sx={{listStyle: "decimal", pl: 4}} disablePadding>
        {choiceTexts && choiceTexts.map((item) =>
            <ListItem component="li"
                      sx={{display: 'list-item'}}
                      key={`choice_text_${item.id}`}>{item.text}</ListItem>
        )}
    </List>
}