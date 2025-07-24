import React from "react";
import {Choice, db} from "@/lib/db";
import {useLiveQuery} from "dexie-react-hooks";
import {Button} from "@mui/material";

export interface ChoiceButtonProps {
    choice: Choice
}

export default function ChoiceButton({choice}: ChoiceButtonProps) {
    const choiceTexts = useLiveQuery(() => db.choice_texts.where('choiceId').equals(choice.id!).toArray());

    return <Button size="small" variant="text">{choiceTexts ? choiceTexts[0].text : ''}</Button>
}