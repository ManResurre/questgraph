import React from "react";
import {Choice} from "@/lib/db";
import {Button} from "@mui/material";

export interface ChoiceButtonProps {
    choice: Choice
}

export default function ChoiceButton({choice}: ChoiceButtonProps) {
    return <Button size="small" variant="text">{choice.text}</Button>
}
