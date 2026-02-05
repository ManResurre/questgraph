import React, {useState} from "react";
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Card,
    Typography,
    Divider,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContentText,
    DialogActions,
    DialogContent,
    ListSubheader,
    Button,
} from "@mui/material";
import {Edit, Delete} from "@mui/icons-material";
import {Quest} from "@/lib/QuestRepository";
import {User} from "@supabase/supabase-js";
import {useQueryClient} from "@tanstack/react-query";
import {Link, useRouterState} from "@tanstack/react-router";
import {useQuests} from "@/components/quest/QuestContext";

interface QuestListProps {
    user?: User | null;
}

export function QuestList({user}: QuestListProps) {
    const {quests, deleteQuest, editQuest} = useQuests();
    const queryClient = useQueryClient();

    // TanStack Router pathname
    const pathname = useRouterState({
        select: (s) => s.location.pathname,
    });

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Quest | null>(null);

    const handleEditClick = (quest: Quest) => {
        editQuest(quest);
    };

    const handleDeleteClick = (quest: Quest) => {
        setItemToDelete(quest);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            await deleteQuest(itemToDelete.id!);
            await queryClient.invalidateQueries({queryKey: ["quests"]});
        }
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    return (
        <Card>
            <Box p={1}>
                <List disablePadding>
                    <ListSubheader>Quests List</ListSubheader>
                    <Divider/>

                    {quests?.map((quest, i) => (
                        <ListItem
                            key={`quest_item_${i}`}
                            secondaryAction={
                                <>
                                    <IconButton
                                        edge="end"
                                        aria-label="edit"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEditClick(quest);
                                        }}
                                        sx={{mr: 0.5}}
                                    >
                                        <Edit fontSize="small"/>
                                    </IconButton>

                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteClick(quest);
                                        }}
                                    >
                                        <Delete fontSize="small" color="error"/>
                                    </IconButton>
                                </>
                            }
                        >
                            <ListItemButton
                                component={Link}
                                to={`${pathname}/${quest.id}`}
                            >
                                <ListItemText
                                    primary={
                                        <Typography
                                            color={user?.id === quest.user_id ? "success.main" : "text.primary"}
                                            fontWeight={600}
                                        >
                                            {quest.name} — {quest.user_id}
                                        </Typography>
                                    }
                                    sx={{my: 0}}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Box>

            <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
                <DialogTitle>Confirm deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this quest?
                        <br/>
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>

                <DialogActions>
                    <Button onClick={cancelDelete} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDelete}
                        variant="outlined"
                        color="error"
                        autoFocus
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
