import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";
import Profile from "@/pages/profile/page";

export const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: Profile,
});
