import React, {useState} from "react";
import NewChoice from "@/app/components/choice/NewChoice";
import {Divider, Stack} from "@mui/material";
import ChoiceList from "@/app/components/choice/ChoiceList";
import {Choice} from "@/lib/db";

const ChoiceManagement = () => {
    const [editingChoice,setEditingChoice] = useState<Choice>()

    return <Stack p={1} spacing={1}>
        <NewChoice editing={editingChoice}/>
        <Divider/>
        <ChoiceList onEdit={setEditingChoice} editing={editingChoice}/>
    </Stack>
}

export default React.memo(ChoiceManagement);
