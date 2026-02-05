import {createRoute} from "@tanstack/react-router";
import {rootRoute} from "./__root";
import Home from "@/pages/home/page";

export const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: Home,
});
