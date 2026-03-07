import {createRoute} from "@tanstack/react-router";
import {rootRoute} from "./__root";
import Sandbox from "@/pages/sandbox/page";

export const sandboxRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/sandbox",
    component: Sandbox,
});
