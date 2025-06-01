'use client'
import React, {useEffect, useState} from "react";
import {
    Box,
    Grid,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Card,
    CardHeader,
    CardContent,
    Typography,
    TextField,
    Divider,
    Switch,
    FormControlLabel,
    Button,
    Avatar,
    IconButton,
    useTheme, Container, Dialog, DialogTitle, DialogContentText, DialogActions, DialogContent, CircularProgress
} from '@mui/material';
import {Add, Edit, Delete} from '@mui/icons-material';
import {QuestEditForm} from "@/app/components/quest_list/QuestEditForm";
import {IQuest} from "@/app/components/quest_list/QuestService";
import {useQuestContext} from "@/app/components/quest_list/QuestsProvider";
import Link from "next/link";
import {Quest} from "@/entity";

export function QuestList({quests}: { quests?: Quest[] }) {
    const {service} = useQuestContext();

    const handleEditClick = (quest: IQuest) => {
        service?.setEdit(quest)
    }

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const handleDeleteClick = (item: any) => {
        setItemToDelete(item);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        // if (itemToDelete) {
        //     setItems(items.filter(i => i.id !== itemToDelete.id));
        // }
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const cancelDelete = () => {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    };

    const handleNewQuest = () => {
        service?.setEdit(undefined);
    }

    return <Grid container>
        <Grid size={6}>
            <Card>
                <Box p={1}>
                    {/*{service && service?.loading && <CircularProgress color="inherit"/>}*/}
                    <List disablePadding>
                        <ListItemButton>
                            <ListItemText sx={{textAlign: "center"}} onClick={handleNewQuest} primary="New Qest"/>
                        </ListItemButton>
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
                                    href={`/quests/${quest.id}`}
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
        </Grid>
        <Grid size={6}>
            <Box>
                <QuestEditForm/>
            </Box>
        </Grid>
    </Grid>
}
