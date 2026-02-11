import { createRoute, Outlet } from "@tanstack/react-router";
import { rootRoute } from "./__root";
import QuestsLayout from "@/pages/quests/layout";
import QuestsPage from "@/pages/quests/page";
import QuestPage from "@/pages/quests/id/page";
import PlayQuestPage from "@/pages/quests/id/play/page";

export const questsIndexRoute = createRoute({
  getParentRoute: () => questsRoute,
  path: "/",
  component: () => <QuestsPage />,
});

export const questIdParentRoute = createRoute({
  getParentRoute: () => questsRoute,
  path: "$id",
});

export const questIdRoute = createRoute({
  getParentRoute: () => questIdParentRoute,
  path: "/",
  component: () => <QuestPage />,
});

export const questIdPlayRoute = createRoute({
  getParentRoute: () => questIdParentRoute,
  path: "play",
  component: () => <PlayQuestPage />,
});

export const questsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "quests",
  component: () => (
    <QuestsLayout>
      <Outlet />
    </QuestsLayout>
  ),
});
