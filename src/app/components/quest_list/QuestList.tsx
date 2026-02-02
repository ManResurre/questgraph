'use client'
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
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContentText,
    DialogActions,
    DialogContent,
    ListSubheader
} from '@mui/material';
import {Edit, Delete} from '@mui/icons-material';
import Link from "next/link";
import {usePathname} from "next/navigation";
import {QuestInsert, Quest} from "@/lib/QuestRepository";
import {User} from "@supabase/supabase-js";
import {useQueryClient} from "@tanstack/react-query";
import {useQuests} from "@/app/components/quest/QuestContext";

interface QuestListProps {
    user?: User | null
}

export function QuestList({user}: QuestListProps) {
    const {quests, deleteQuest, editQuest} = useQuests();
    const pathname = usePathname();
    const queryClient = useQueryClient();

    const handleEditClick = (quest: Quest) => {
        editQuest(quest);
    }

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Quest | null>(null);
    const handleDeleteClick = (item: any) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (itemToDelete) {
            await deleteQuest(itemToDelete.id!)
        }
        await queryClient.invalidateQueries({queryKey: ["quests"]});
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const handleNewQuest = () => {
    }

    return <Card>
        <Box p={1}>
            <List disablePadding>
                <ListSubheader>
                    Quests List
                </ListSubheader>
                {/*<ListItemButton>*/}
                {/*    <ListItemText sx={{textAlign: "center"}} onClick={handleNewQuest} primary="New Qest"/>*/}
                {/*</ListItemButton>*/}
                <Divider/>

                {quests?.map((quest, i) =>

                    <ListItem key={`quest_item_${i}`}
                              secondaryAction={<>
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
                            href={`${pathname}/${quest.id}`}
                        >

                            <ListItemText
                                primary={
                                    <Typography color={user?.id == quest.user_id ? "success" : "textPrimary"}
                                                fontWeight={600}>
                                        {quest.name} - {quest.user_id}
                                    </Typography>
                                }
                                // secondary={
                                //     <Typography
                                //         variant="body2"
                                //         color="text.secondary"
                                //     >
                                //         Desc
                                //     </Typography>
                                // }
                                sx={{my: 0}}
                            />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
        </Box>
        <Dialog
            open={deleteDialogOpen}
            onClose={cancelDelete}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                Confirm deletion
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    A you sure to delete this quest?
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
}
