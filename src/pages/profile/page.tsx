import React from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useLocalUser } from "@/hooks/useLocalUser";

const Profile = () => {
  const { localUser, loading } = useLocalUser();

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} скопирован в буфер обмена`);
    } catch (err) {
      console.error("Не удалось скопировать:", err);
    }
  };

  if (loading) {
    return <Container>Загрузка...</Container>;
  }

  if (!localUser) {
    return (
      <Container>
        <Typography>Пользователь не найден</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Профиль
      </Typography>

      <Paper sx={{ p: 3, mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Ключи аутентификации
        </Typography>

        <Box sx={{ mt: 2 }}>
          <TextField
            label="Имя"
            value={localUser.name || "—"}
            fullWidth
            margin="normal"
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Public Key"
            value={localUser.publicKey}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <IconButton
                  onClick={() => handleCopy(localUser.publicKey, "Public Key")}
                  size="small"
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              ),
            }}
          />

          <TextField
            label="Private Key"
            value={localUser.privateKey}
            fullWidth
            margin="normal"
            multiline
            rows={4}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <IconButton
                  onClick={() =>
                    handleCopy(localUser.privateKey, "Private Key")
                  }
                  size="small"
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              ),
            }}
          />

          {localUser.auth_id && (
            <TextField
              label="Auth ID"
              value={localUser.auth_id}
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
            />
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;
