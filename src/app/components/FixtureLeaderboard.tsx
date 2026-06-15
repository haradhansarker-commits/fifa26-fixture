import { useNavigate, useSearchParams } from "react-router";
import { ChevronLeft } from "lucide-react";
import { FixtureList } from "./FixtureList";
import { LeaderboardTable } from "./LeaderboardTable";
import { KnockoutBracket } from "./KnockoutBracket";
import { TopScorers } from "../pages/TopScorers";

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
  const navigate = useNavigate();

  const rawTab = searchParams.get("tab") as Tab | null;
  const activeTab: Tab = rawTab && VALID_TABS.has(rawTab) ? rawTab : "fixtures";

  function setActiveTab(tab: Tab) {
    setSearchParams({ tab }, { replace: true });
  }

  return (
    <div className="flex flex-col min-h-full w-full bg-background text-foreground">
      <header className="sticky top-0 z-40 bg-background">
        <div className="px-6 py-2 flex items-center justify-between">
          <button
            aria-label="Back"
            onClick={() => navigate(-1)}
            className="text-foreground hover:opacity-80 transition-opacity"
          >
            <ChevronLeft size={24} strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-4 pt-2 pb-4">
          <h1
            className="text-foreground"
            style={{
              fontFamily: "Lexend, sans-serif",
              fontSize: "var(--text-2xl)",
              fontWeight: "var(--font-weight-bold)",
              lineHeight: "32px",
            }}
          >
            FIFA World Cup 2026™
          </h1>
        </div>

        <div
          className="flex items-center overflow-x-auto -mx-4 px-4 border-b border-border"
          style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
        >
          {TABS.map((tab) => (
            <TabItem
              key={tab.id}
              label={tab.label}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 px-4 py-5">
        {activeTab === "fixtures" && <FixtureList />}
        {activeTab === "standings" && <LeaderboardTable />}
        {activeTab === "knockout" && <KnockoutBracket />}
        {activeTab === "scorers" && <TopScorers inline />}
      </main>
    </div>
  );
}

function TabItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 relative flex items-center justify-center"
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
          fontFamily: "Lexend, sans-serif",
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
