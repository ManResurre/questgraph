import React, {useCallback, useMemo} from "react";
import {Choice} from "@/lib/db";
import {Box, IconButton, ListItem, ListItemText, Stack, Typography} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from '@mui/icons-material/Edit';
import {deleteChoice} from "@/lib/ChoiceRepository";

export interface ChoiceItemProps {
    choice: Choice,
    highlight?: string,
    onEdit?: ((value: (((prevState: (Choice | undefined)) => (Choice | undefined)) | Choice | undefined)) => void) | undefined
}

const ChoiceItem = React.memo(({choice, highlight, onEdit}: ChoiceItemProps) => {
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

    const handleDelete = () => {
        deleteChoice(Number(choice.id));
    }

    return (
        <ListItem
            secondaryAction={
                <Box>
                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onEdit)
                                onEdit(choice);
                        }}
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
