import { createRoute, Outlet } from "@tanstack/react-router";
import { rootRoute } from "./__root";
import ProfileLayout from "@/pages/profile/layout";
import Profile from "@/pages/profile/page";

export const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => (
    <ProfileLayout>
      <Profile />
    </ProfileLayout>
  ),
});
