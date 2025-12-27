import React, {useCallback, useMemo} from "react";
import {Choice} from "@/lib/db";
import {Box, IconButton, ListItem, ListItemText, Stack, Typography} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit';
import {deleteChoice} from "@/lib/ChoiceRepository";
import {useChoiceContext} from "@/app/components/choice/ChoiceProvider";
import {useQueryClient} from "@tanstack/react-query";
import {useSidebar} from "@/app/components/sidebar/graphSidebarProvider";

export interface ChoiceItemProps {
    choice: Choice,
    highlight?: string,
}

const ChoiceItem = React.memo(({choice, highlight}: ChoiceItemProps) => {
    const queryClient = useQueryClient();
    const {setEditingChoice} = useChoiceContext();
    const {setLoading} = useSidebar();

    const highlightText = useCallback((text: string) => {
        if (!highlight || !text) return text;

        const regex = new RegExp(`(${highlight})`, "gi");
        const parts = text.split(regex);

        return parts.map((part, i) =>
            part.toLowerCase() === highlight.toLowerCase() ?
                <mark key={i} style={{backgroundColor: "#ffeb3b"}}>{part}</mark> :
                part
        );
    }, [highlight]);

    const handleDelete = useCallback(async () => {
        setLoading(true);
        await deleteChoice(Number(choice.id));
        await queryClient.invalidateQueries({queryKey: ["scenesWithChoices"]});
        await queryClient.invalidateQueries({queryKey: ["getChoices"]});
    }, [choice])

    const handleEdit = () => {
        setEditingChoice(choice)
    }

    return (
        <ListItem
            secondaryAction={
                <Box>
                    <IconButton
                        onClick={handleEdit}
                        sx={{mr: 0.5}}
                    >
                        <EditIcon fontSize="small"/>
                    </IconButton>
                    <IconButton

                        onClick={(e) => handleDelete()}
                        sx={{mr: 0.5}}
                    >
                        <DeleteIcon fontSize="small"/>
                    </IconButton>
                </Box>
            }
        >
            <ListItemText
                primary={highlightText(choice.label)}
                secondary={
                    <span>{highlightText(choice.text)}</span>
                }
                slotProps={
                    {
                        secondary: {
                            component: "div"
                        }
                    }
                }
                sx={{
                    pr: 8,
                    minWidth: 0,
                    '& .MuiTypography-root': {
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'normal'
                    }
                }}
            />
        </ListItem>
    )
});

export default React.memo(ChoiceItem);
