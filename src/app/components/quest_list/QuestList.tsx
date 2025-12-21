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
import {useQuestContext} from "@/app/components/quest_list/QuestsProvider";
import Link from "next/link";
import {Quest} from "@/lib/db";
import {usePathname} from "next/navigation";
import {deleteQuest} from "@/lib/QuestRepository";
import {QueryObserverResult, RefetchOptions} from "@tanstack/react-query";

interface QuestListProps {
    quests?: Quest[];
    refetch?: (
        options?: RefetchOptions
    ) => Promise<QueryObserverResult<Quest[] | null, Error>>;
}

export function QuestList({quests, refetch}: QuestListProps) {
    const pathname = usePathname()

    const handleEditClick = (quest: Quest) => {
        // questService?.edit(quest);
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
        setDeleteDialogOpen(false);
        setItemToDelete(null);

        if (refetch)
            refetch();
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
                                    <Typography fontWeight={600}>
                                        {quest.name}
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
