import { Box, Button } from "@mui/material";
import { createRoute, Link } from "@tanstack/react-router";
import { Scene1 } from "@/pages/sandbox/scene1";
import { sandboxLayoutRoute } from "./_layout";

export const sandboxScene1Route = createRoute({
  getParentRoute: () => sandboxLayoutRoute,
  path: "scene1",
  component: Scene1Wrapper,
});

function Scene1Wrapper() {
  return (
    <Box
      height="100%"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap={2}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Button component={Link} to="/sandbox" size="small" variant="outlined">
          ← Back
        </Button>
      </Box>
      <Scene1 />
    </Box>
  );
}
