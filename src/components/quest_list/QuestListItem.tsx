import React from "react";
import {
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { Delete, Edit, PlayArrow } from "@mui/icons-material";
import { Link, useNavigate } from "@tanstack/react-router";
import { Quest } from "@/lib/QuestRepository.ts";
import { useQuests } from "@/components/quest/QuestContext.tsx";
import { useCurrentUser } from "@/hooks/useCurrentUser.ts";

interface QuestListItemProps {
  quest: Quest;
  onDelete: (quest: Quest) => void;
}

const QuestListItem = ({ quest, onDelete }: QuestListItemProps) => {
  const { editQuest } = useQuests();
  const { user } = useCurrentUser();
  const navigate = useNavigate();

  const handlePlayClick = () => {
    // Обработчик клика для запуска квеста
    navigate({ to: `/quests/${quest.id}/play` });
  };

  const handleEditClick = () => {
    editQuest(quest);
  };

  const handleDeleteClick = () => {
    onDelete(quest);
  };

  return (
    <ListItem
      secondaryAction={
        <>
          <IconButton
            edge="end"
            aria-label="play"
            onClick={(e) => {
              e.stopPropagation();
              handlePlayClick();
            }}
            sx={{ mr: 0.5 }}
          >
            <PlayArrow fontSize="small" color="primary" />
          </IconButton>

          <IconButton
            edge="end"
            aria-label="edit"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick();
            }}
            sx={{ mr: 0.5 }}
          >
            <Edit fontSize="small" />
          </IconButton>

          <IconButton
            edge="end"
            aria-label="delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick();
            }}
          >
            <Delete fontSize="small" color="error" />
          </IconButton>
        </>
      }
    >
      <ListItemButton component={Link} to={`quests/${quest.id}`}>
        <ListItemText
          primary={
            <Typography
              color={
                user?.id === quest.user_id ? "success.main" : "text.primary"
              }
              fontWeight={600}
            >
              {quest.name} — {quest.user_id}
            </Typography>
          }
          sx={{ my: 0 }}
        />
      </ListItemButton>
    </ListItem>
  );
};

export default React.memo(QuestListItem);
