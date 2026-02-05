import {createRoute, Outlet} from "@tanstack/react-router";
import {rootRoute} from "./__root";
import QuestsLayout from "@/quests/layout";
import QuestsPage from "@/quests/page";
import QuestPage from "@/quests/id/page";

export const questsIndexRoute = createRoute({
    getParentRoute: () => questsRoute,
    path: "/",
    component: () => <QuestsPage/>,
});

export const questIdRoute = createRoute({
    getParentRoute: () => questsRoute,
    path: "$id",
    component: () => <QuestPage/>,
});

export const questsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "quests",
    component: () => (
        <QuestsLayout>
            <Outlet/>
        </QuestsLayout>
    ),
});
