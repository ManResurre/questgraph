import { Box, Button } from "@mui/material";
import { createRoute, Link } from "@tanstack/react-router";
import { Scene2 } from "@/pages/sandbox/scene2";
import { sandboxLayoutRoute } from "./_layout";

export const sandboxScene2Route = createRoute({
  getParentRoute: () => sandboxLayoutRoute,
  path: "scene2",
  component: Scene2Wrapper,
});

function Scene2Wrapper() {
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
      <Scene2 />
    </Box>
  );
}
