import {rootRoute} from "./__root";
import {homeRoute} from "./home";
import {questIdRoute, questsIndexRoute, questsRoute} from "./quests";
import {aboutRoute} from "./about";
import {createRouter} from "@tanstack/react-router";

const routeTree = rootRoute.addChildren([
    homeRoute,
    questsRoute.addChildren([
        questsIndexRoute,
        questIdRoute
    ]),
    aboutRoute,
]);

export const router = createRouter({routeTree});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}
