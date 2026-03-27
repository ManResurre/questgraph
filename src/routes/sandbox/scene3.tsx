import { Box, Button } from "@mui/material";
import { createRoute, Link } from "@tanstack/react-router";
import Scene3 from "@/pages/sandbox/scene3";
import { sandboxLayoutRoute } from "./_layout";

export const sandboxScene3Route = createRoute({
  getParentRoute: () => sandboxLayoutRoute,
  path: "scene3",
  component: Scene3Wrapper,
});

function Scene3Wrapper() {
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
      <Scene3 />
    </Box>
  );
}
