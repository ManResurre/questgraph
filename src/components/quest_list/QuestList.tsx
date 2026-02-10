import React, { useState } from "react";
import {
  Box,
  List,
  Card,
  Divider,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogActions,
  DialogContent,
  ListSubheader,
  Button,
} from "@mui/material";
import { Quest } from "@/lib/QuestRepository";
import { useQueryClient } from "@tanstack/react-query";
import { useQuests } from "@/components/quest/QuestContext";
import QuestListItem from "@/components/quest_list/QuestListItem.tsx";
import { useCurrentUser } from "@/hooks/useCurrentUser.ts";
import { createQuestCompareFunction } from "@/lib/QuestHelper";

export function QuestList() {
  const { user } = useCurrentUser();
  const { quests, deleteQuest } = useQuests();
  const queryClient = useQueryClient();

  const [itemToDelete, setItemToDelete] = useState<Quest | null>(null);

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteQuest(itemToDelete.id!);
      await queryClient.invalidateQueries({ queryKey: ["quests"] });
    }
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };

  return (
    <Card>
      <Box p={1}>
        <List disablePadding>
          <ListSubheader>Quests List</ListSubheader>
          <Divider />

          {quests?.sort(createQuestCompareFunction(user)).map((quest) => (
            <QuestListItem
              key={`quest_item_${quest.id}`}
              quest={quest}
              onDelete={setItemToDelete}
            />
          ))}
        </List>
      </Box>

      <Dialog open={!!itemToDelete} onClose={cancelDelete}>
        <DialogTitle>Confirm deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this quest?
            <br />
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
