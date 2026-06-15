import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { FixtureLeaderboard } from "./components/FixtureLeaderboard";
import { MatchDetail } from "./pages/MatchDetail";
import { TeamProfile } from "./pages/TeamProfile";
import { PlayerCard } from "./pages/PlayerCard";
import { TopScorers } from "./pages/TopScorers";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: FixtureLeaderboard },
      { path: "match/:id", Component: MatchDetail },
      { path: "team/:code", Component: TeamProfile },
      { path: "player/:id", Component: PlayerCard },
      { path: "top-scorers", Component: TopScorers },
    ],
  },
]);
