import { rootRoute } from "./__root";
import { homeRoute } from "./home";
import {
  questIdParentRoute,
  questIdPlayRoute,
  questIdRoute,
  questsIndexRoute,
  questsRoute,
} from "./quests";
import { aboutRoute } from "./about";
import { profileRoute } from "./profile";
import { sandboxLayoutRoute } from "./sandbox/_layout";
import { sandboxIndexRoute } from "./sandbox";
import { sandboxScene1Route } from "./sandbox/scene1";
import { sandboxScene2Route } from "./sandbox/scene2";
import { createRouter } from "@tanstack/react-router";

const routeTree = rootRoute.addChildren([
  homeRoute,
  questsRoute.addChildren([
    questsIndexRoute,
    questIdParentRoute.addChildren([questIdRoute, questIdPlayRoute]),
  ]),
  aboutRoute,
  profileRoute,
  sandboxLayoutRoute.addChildren([
    sandboxIndexRoute,
    sandboxScene1Route,
    sandboxScene2Route,
  ]),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
