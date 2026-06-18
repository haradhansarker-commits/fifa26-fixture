import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { motion } from "motion/react";
import { FixtureList, type Selection } from "./FixtureList";
import { LeaderboardTable, type TeamSelection } from "./LeaderboardTable";
import { KnockoutBracket } from "./KnockoutBracket";
import { TournamentSummary } from "./TournamentSummary";
import { TopScorers, ScorersRail, ScorersPane } from "../pages/TopScorers";
import { MatchDetail } from "../pages/MatchDetail";
import { TeamProfile } from "../pages/TeamProfile";
import { useFixtures, useStandings, useKnockout } from "../services/useLiveData";
import type { LbCategory } from "../services/fifaData";

type Tab = "fixtures" | "standings" | "knockout" | "scorers";

const TABS: { id: Tab; label: string }[] = [
  { id: "fixtures", label: "Fixtures" },
  { id: "standings", label: "Standings" },
  { id: "knockout", label: "Knockout" },
  { id: "scorers", label: "Leaderboard" },
];

const VALID_TABS = new Set<Tab>(["fixtures", "standings", "knockout", "scorers"]);

export function FixtureLeaderboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isDesktop = useIsDesktop();
  const { data: matches } = useFixtures();
  const { data: groups } = useStandings();
  const { data: rounds } = useKnockout();

  const rawTab = searchParams.get("tab") as Tab | null;
  const activeTab: Tab = rawTab && VALID_TABS.has(rawTab) ? rawTab : "fixtures";

  function setActiveTab(tab: Tab) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", tab);
        // Each tab drives its own detail pane; drop the others' selection so the
        // new tab falls back to its own sensible default.
        next.delete("match");
        next.delete("team");
        next.delete("cat");
        return next;
      },
      { replace: true },
    );
  }

  const setParam = (key: string, value: string) =>
    setSearchParams(
      (prev) => {
        const n = new URLSearchParams(prev);
        n.set(key, value);
        return n;
      },
      { replace: true },
    );

  // Which match the right pane shows (fixtures + knockout), defaulting so the
  // pane is never empty: live → next → first for fixtures, first decided tie for
  // knockout.
  const live = matches.find((m) => m.status === "live");
  const next = matches.find((m) => m.status === "upcoming");
  const fixturesDefault = (live ?? next ?? matches[0])?.id;
  const knockoutDefault = rounds.flatMap((r) => r.matches).find((m) => m.matchId)?.matchId;
  const matchParam = searchParams.get("match");
  const selectedMatchId =
    matchParam ?? (activeTab === "knockout" ? knockoutDefault : fixturesDefault);

  // Which team the standings pane shows; defaults to Group A's leader.
  const selectedTeamCode = searchParams.get("team") ?? groups[0]?.teams[0]?.code;

  // Which leaderboard category the scorers pane shows.
  const selectedCat = (searchParams.get("cat") as LbCategory | null) ?? "goals";

  const matchSelection: Selection = isDesktop ? { selectedId: selectedMatchId, onSelect: (id) => setParam("match", id) } : null;
  const teamSelection: TeamSelection = isDesktop ? { selectedCode: selectedTeamCode, onSelect: (code) => setParam("team", code) } : null;

  const splitView = isDesktop;

  // Desktop master-detail: two columns from the top. Left rail holds the title,
  // pulse widget, tabs and the active list; right column is the contextual detail.
  if (splitView) {
    return (
      <div className="flex flex-col min-h-full w-full bg-background text-foreground">
        <div className="w-full max-w-[1440px] mx-auto grid grid-cols-[minmax(360px,430px)_1fr] items-start gap-6 px-6 pt-7 pb-10">
          <div className="flex flex-col gap-4">
            <Hero />
            <TabBar active={activeTab} onSelect={setActiveTab} sticky={false} />
            {activeTab === "fixtures" && <FixtureList selection={matchSelection} />}
            {activeTab === "standings" && <LeaderboardTable teamSelection={teamSelection} />}
            {activeTab === "knockout" && <KnockoutBracket selection={matchSelection} />}
            {activeTab === "scorers" && <ScorersRail active={selectedCat} onSelect={(c) => setParam("cat", c)} />}
          </div>
          {activeTab === "standings" ? (
            <TeamPane code={selectedTeamCode} />
          ) : activeTab === "scorers" ? (
            <DetailPane>
              <ScorersPane activeId={selectedCat} />
            </DetailPane>
          ) : (
            <MatchPane id={selectedMatchId} />
          )}
        </div>
      </div>
    );
  }

  // Mobile (any tab) and desktop non-fixtures tabs: single full-width column.
  return (
    <div className="flex flex-col min-h-full w-full bg-background text-foreground">
      <div className="w-full max-w-[1440px] mx-auto">
        <div className="px-4 lg:px-6 pt-7 pb-4">
          <Hero />
        </div>

        <TabBar active={activeTab} onSelect={setActiveTab} sticky />

        <main className="px-4 lg:px-6 py-5 pb-10">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <TabContent tab={activeTab} />
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div className="flex flex-col gap-4">
      <h1
        className="text-foreground"
        style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-weight-bold)", lineHeight: "32px" }}
      >
        FIFA World Cup 2026™
      </h1>
      <TournamentSummary />
    </div>
  );
}

function TabContent({ tab }: { tab: Tab }) {
  switch (tab) {
    case "fixtures":
      return <FixtureList />;
    case "standings":
      return <LeaderboardTable />;
    case "knockout":
      return <KnockoutBracket />;
    case "scorers":
      // Tables read best capped; on desktop full-bleed they'd sprawl.
      return (
        <div className="lg:max-w-3xl">
          <TopScorers inline />
        </div>
      );
  }
}

/** The desktop right-hand detail column. Sticks in view while the left list
 *  scrolls, with its own overflow so long detail stays self-contained. */
function DetailPane({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="sticky top-3 self-start max-h-[calc(100vh-1.5rem)] overflow-y-auto pb-8"
      style={{ scrollbarWidth: "none" }}
    >
      {children}
    </div>
  );
}

function MatchPane({ id }: { id?: string }) {
  return (
    <DetailPane>
      <h2 className="text-foreground pb-4" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-weight-bold)" }}>
        Match
      </h2>
      {id ? (
        <MatchDetail id={id} inline />
      ) : (
        <p className="text-muted-foreground py-10 text-center" style={{ fontSize: "var(--text-sm)" }}>
          Select a match to see lineups, events and stats.
        </p>
      )}
    </DetailPane>
  );
}

function TeamPane({ code }: { code?: string }) {
  return (
    <DetailPane>
      {code ? (
        <TeamProfile code={code} inline />
      ) : (
        <p className="text-muted-foreground py-10 text-center" style={{ fontSize: "var(--text-sm)" }}>
          Select a team to see its group standing and fixtures.
        </p>
      )}
    </DetailPane>
  );
}

function TabBar({ active, onSelect, sticky }: { active: Tab; onSelect: (t: Tab) => void; sticky: boolean }) {
  return (
    <div className={sticky ? "sticky top-0 z-40 bg-background" : ""}>
      <div
        role="tablist"
        aria-label="Tournament views"
        className={`flex items-center overflow-x-auto border-b border-border ${sticky ? "px-4 lg:px-6" : ""}`}
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {TABS.map((tab) => (
          <TabItem key={tab.id} id={tab.id} label={tab.label} active={active === tab.id} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function TabItem({
  id,
  label,
  active,
  onSelect,
}: {
  id: Tab;
  label: string;
  active: boolean;
  onSelect: (tab: Tab) => void;
}) {
  // Roving tab list: Left/Right move focus (and selection) between tabs, the
  // standard WAI-ARIA tablist keyboard pattern.
  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const tabs = Array.from(
      e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? [],
    );
    const i = tabs.indexOf(e.currentTarget);
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    next?.focus();
    next?.click();
  };

  return (
    <button
      role="tab"
      id={`tab-${id}`}
      aria-selected={active}
      aria-controls={`panel-${id}`}
      tabIndex={active ? 0 : -1}
      onClick={() => onSelect(id)}
      onKeyDown={onKeyDown}
      className="shrink-0 relative flex items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {active && (
        <span
          aria-hidden
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{ height: "2px", background: "var(--foreground)" }}
        />
      )}
      <span
        className="px-4 py-2.5 whitespace-nowrap"
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: active ? "var(--font-weight-medium)" : "var(--font-weight-normal)",
          lineHeight: "20px",
          color: active ? "var(--foreground)" : "var(--muted-foreground)",
        }}
      >
        {label}
      </span>
    </button>
  );
}

/** Tracks the lg breakpoint so the home can switch to its two-pane layout. */
function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => setDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return desktop;
}
