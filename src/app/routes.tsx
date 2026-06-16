import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { FixtureLeaderboard } from "./components/FixtureLeaderboard";
import { MatchDetail } from "./pages/MatchDetail";
import { TeamProfile } from "./pages/TeamProfile";
import { TopScorers } from "./pages/TopScorers";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: FixtureLeaderboard },
      { path: "match/:id", Component: MatchDetail },
      { path: "team/:code", Component: TeamProfile },
      { path: "top-scorers", Component: TopScorers },
    ],
  },
]);
