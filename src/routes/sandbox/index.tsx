import { Box, Button, Typography } from "@mui/material";
import { createRoute, Link } from "@tanstack/react-router";
import { sandboxLayoutRoute } from "./_layout";

export const sandboxIndexRoute = createRoute({
  getParentRoute: () => sandboxLayoutRoute,
  path: "/",
  component: SandboxIndex,
});

function SandboxIndex() {
  return (
    <Box
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={3}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Sandbox
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        <Button
          variant="contained"
          size="large"
          component={Link}
          to="/sandbox/scene1"
          sx={{ minWidth: 200 }}
        >
          Scene 1 — Боты с DQN
        </Button>

        <Button
          variant="contained"
          size="large"
          component={Link}
          to="/sandbox/scene2"
          sx={{ minWidth: 200 }}
        >
          Scene 2 — Тестовый круг
        </Button>
      </Box>
    </Box>
  );
}
