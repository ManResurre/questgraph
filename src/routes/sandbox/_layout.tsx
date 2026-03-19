import { Outlet, createRoute } from "@tanstack/react-router";
import { rootRoute } from "../__root";

export const sandboxLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "sandbox",
  component: () => (
    <Outlet />
  ),
});
