import { useState } from "react";
import { Goal, Handshake, Square, Target } from "lucide-react";
import { Flag } from "../components/Flag";
import { PageHeader } from "../components/PageHeader";
import {
  getLeaderboard,
  type LeaderboardCategory,
  type LeaderboardEntry,
} from "../services/liveData";

type CategoryDef = {
  id: LeaderboardCategory;
  label: string;
  short: string;
  metricLabel: string;
  icon: React.ReactNode;
  accent: string;
};

const CATEGORIES: CategoryDef[] = [
  {
    id: "goals",
    label: "Top Scorers",
    short: "Goals",
    metricLabel: "G",
    icon: <Goal size={14} strokeWidth={2} />,
    accent: "var(--chart-1)",
  },
  {
    id: "assists",
    label: "Assists",
    short: "Assists",
    metricLabel: "A",
    icon: <Handshake size={14} strokeWidth={2} />,
    accent: "var(--chart-2)",
  },
  {
    id: "shotsOnTarget",
    label: "Shots on Target",
    short: "SoT",
    metricLabel: "SoT",
    icon: <Target size={14} strokeWidth={2} />,
    accent: "var(--chart-4)",
  },
  {
    id: "yellow",
    label: "Yellow Cards",
    short: "Yellow",
    metricLabel: "YC",
    icon: <Square size={14} strokeWidth={2} fill="#facc15" stroke="#facc15" />,
    accent: "#facc15",
  },
  {
    id: "red",
    label: "Red Cards",
    short: "Red",
    metricLabel: "RC",
    icon: <Square size={14} strokeWidth={2} fill="var(--chart-5)" stroke="var(--chart-5)" />,
    accent: "var(--chart-5)",
  },
];

export function TopScorers({ inline }: { inline?: boolean }) {
  const [activeId, setActiveId] = useState<LeaderboardCategory>("goals");
  const active = CATEGORIES.find((c) => c.id === activeId)!;
  const entries = getLeaderboard(activeId);

  const body = (
    <div className="flex flex-col gap-4">
      <CategoryPills active={activeId} onChange={setActiveId} />
      <SectionHeader category={active} count={entries.length} />
      <LeaderboardCard entries={entries} category={active} />
    </div>
  );

  if (inline) {
    return <div className="pb-8">{body}</div>;
  }

  return (
    <>
      <PageHeader title="Leaderboard" subtitle="FIFA World Cup 2026" />
      <main className="px-4 pb-8">{body}</main>
    </>
  );
}

function CategoryPills({
  active,
  onChange,
}: {
  active: LeaderboardCategory;
  onChange: (id: LeaderboardCategory) => void;
}) {
  return (
    <div
      className="flex items-center gap-2 overflow-x-auto -mx-4 px-4"
      style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
    >
      {CATEGORIES.map((c) => {
        const isActive = c.id === active;
        return (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full border transition-colors"
            style={{
              fontFamily: "Lexend, sans-serif",
              fontSize: "var(--text-xs)",
              fontWeight: isActive
                ? "var(--font-weight-semibold)"
                : "var(--font-weight-medium)",
              background: isActive ? "var(--foreground)" : "var(--card)",
              color: isActive ? "var(--background)" : "var(--muted-foreground)",
              borderColor: isActive ? "var(--foreground)" : "var(--border)",
            }}
          >
            <span style={{ display: "inline-flex", color: isActive ? "var(--background)" : c.accent }}>
              {c.icon}
            </span>
            <span>{c.short}</span>
          </button>
        );
      })}
    </div>
  );
}

function SectionHeader({ category, count }: { category: CategoryDef; count: number }) {
  return (
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        <span style={{ color: category.accent, display: "inline-flex" }}>{category.icon}</span>
        <h2
          className="text-foreground"
          style={{
            fontFamily: "Lexend, sans-serif",
            fontSize: "var(--text-base)",
            fontWeight: "var(--font-weight-semibold)",
          }}
        >
          {category.label}
        </h2>
      </div>
      <span
        className="text-muted-foreground tabular-nums"
        style={{
          fontFamily: "Lexend, sans-serif",
          fontSize: "var(--text-xs)",
          fontWeight: "var(--font-weight-medium)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        Top {count}
      </span>
    </div>
  );
}

function LeaderboardCard({
  entries,
  category,
}: {
  entries: LeaderboardEntry[];
  category: CategoryDef;
}) {
  if (entries.length === 0) {
    return (
      <div
        className="bg-card border border-border rounded-2xl px-4 py-10 text-center text-muted-foreground"
        style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)" }}
      >
        No data yet for {category.label}.
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div
        className="px-3 py-3 grid items-center text-muted-foreground"
        style={{
          gridTemplateColumns: "24px 1fr 44px 44px",
          gap: "6px",
          fontFamily: "Lexend, sans-serif",
          fontSize: "11px",
          fontWeight: "var(--font-weight-medium)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        <span>#</span>
        <span>Player</span>
        <span className="text-center">{category.metricLabel}</span>
        <span className="text-right">Min</span>
      </div>

      {entries.map((e) => (
        <div
          key={e.playerId}
          className="px-3 py-3 grid items-center border-t border-border"
          style={{
            gridTemplateColumns: "24px 1fr 44px 44px",
            gap: "6px",
            fontFamily: "Lexend, sans-serif",
          }}
        >
          <span
            className="text-foreground text-center tabular-nums"
            style={{ fontSize: "14px", fontWeight: "var(--font-weight-medium)" }}
          >
            {e.rank}
          </span>

          <div className="flex items-center gap-2 min-w-0">
            <Flag code={e.nationalityCode} name={e.teamName} size={20} />
            <div className="min-w-0">
              <p
                className="text-foreground truncate"
                style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)" }}
              >
                {e.name}
              </p>
              <p
                className="text-muted-foreground truncate"
                style={{ fontSize: "11px" }}
              >
                {e.teamName}
              </p>
            </div>
          </div>

          <span
            className="text-center tabular-nums"
            style={{
              fontSize: "var(--text-base)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--foreground)",
            }}
          >
            {e.value}
          </span>

          <span
            className="text-muted-foreground text-right tabular-nums"
            style={{ fontSize: "13px" }}
          >
            {e.minutes}'
          </span>
        </div>
      ))}
    </div>
  );
}
