import React, {useEffect} from "react";
import {Box, List, ListItemButton, ListItemText, Paper} from "@mui/material";
import {getChoice, setNextSceneId} from "@/lib/ChoiceRepository";
import {useLiveQuery} from "dexie-react-hooks";
import DeleteIcon from "@mui/icons-material/Delete";
import {useSidebar} from "@/app/components/sidebar/graphSidebarProvider";

interface EdgeEditProps {
    selectedChoiceId: number
}

const EdgeEdit = ({selectedChoiceId}: EdgeEditProps) => {
    const {closeSidebar} = useSidebar();
    const choice = useLiveQuery(() => getChoice(selectedChoiceId))

    const handleRemoveClick = () => {
        setNextSceneId(selectedChoiceId);
        closeSidebar();
    }

    return <Box p={1}>
        {choice && <Paper className="p-1 mb-1">
            {choice.text}
        </Paper>}
        <List className="bg-neutral-900/50 dark:bg-neutral-700/30 rounded-[4px]">
            <ListItemButton onClick={handleRemoveClick}>
                <DeleteIcon/>
                <ListItemText>Remove Edge</ListItemText>
            </ListItemButton>
        </List>
    </Box>
}

export default React.memo(EdgeEdit);
