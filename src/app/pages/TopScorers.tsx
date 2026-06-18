import { useState } from "react";
import { Goal, Handshake, Square, Target } from "lucide-react";
import { Flag } from "../components/Flag";
import { PageHeader } from "../components/PageHeader";
import { useLeaderboards } from "../services/useLiveData";
import type { LbCategory, LbEntry } from "../services/fifaData";
import { LeaderboardSkeleton } from "../components/Skeleton";

type CategoryDef = {
  id: LbCategory;
  label: string;
  short: string;
  metricLabel: string;
  icon: React.ReactNode;
  accent: string;
};

export const CATEGORIES: CategoryDef[] = [
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
    id: "shots",
    label: "Shots",
    short: "Shots",
    metricLabel: "Sh",
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
  const [activeId, setActiveId] = useState<LbCategory>("goals");
  const active = CATEGORIES.find((c) => c.id === activeId)!;
  const { data, loading, error } = useLeaderboards();
  const entries = data[activeId];

  const body = (
    <div className="flex flex-col gap-4">
      <CategoryPills active={activeId} onChange={setActiveId} />
      <SectionHeader category={active} count={entries.length} />
      {loading && entries.length === 0 ? (
        <LeaderboardSkeleton />
      ) : error && entries.length === 0 ? (
        <StatusCard text="Could not load leaderboard from FIFA. Retrying…" />
      ) : (
        <LeaderboardCard entries={entries} category={active} />
      )}
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

/** Desktop leaderboard rail: categories stacked vertically as pill buttons. */
export function ScorersRail({ active, onSelect }: { active: LbCategory; onSelect: (id: LbCategory) => void }) {
  return (
    <div className="flex flex-col items-stretch gap-1.5">
      {CATEGORIES.map((c) => {
        const isActive = c.id === active;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            aria-pressed={isActive}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            style={{
              fontSize: "var(--text-sm)",
              fontWeight: isActive ? "var(--font-weight-semibold)" : "var(--font-weight-medium)",
              background: isActive ? "var(--muted)" : "var(--card)",
              color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
              borderColor: isActive ? "color-mix(in srgb, var(--primary) 40%, var(--border))" : "var(--border)",
            }}
          >
            <span
              className="inline-flex items-center justify-center rounded-lg shrink-0"
              style={{
                width: 28,
                height: 28,
                background: isActive ? "color-mix(in srgb, var(--primary) 16%, transparent)" : "var(--muted)",
                color: c.accent,
              }}
            >
              {c.icon}
            </span>
            <span className="flex-1 text-left">{c.short}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Desktop leaderboard pane: heading + the selected category's full ranking. */
export function ScorersPane({ activeId }: { activeId: LbCategory }) {
  const cat = CATEGORIES.find((c) => c.id === activeId)!;
  const { data, loading, error } = useLeaderboards();
  const entries = data[activeId];

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <span style={{ color: cat.accent, display: "inline-flex" }}>{cat.icon}</span>
          <h2 className="text-foreground" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-weight-bold)" }}>
            {cat.label}
          </h2>
        </div>
        <span
          className="text-muted-foreground tabular-nums"
          style={{ fontSize: "var(--text-xs)", fontWeight: "var(--font-weight-medium)", letterSpacing: "0.05em", textTransform: "uppercase" }}
        >
          Top {entries.length}
        </span>
      </div>

      {loading && entries.length === 0 ? (
        <LeaderboardSkeleton />
      ) : error && entries.length === 0 ? (
        <StatusCard text="Could not load leaderboard from FIFA. Retrying…" />
      ) : (
        <ScorersTable entries={entries} category={cat} />
      )}
    </div>
  );
}

/** Flat, full-width ranking table for the leaderboard pane. */
function ScorersTable({ entries, category }: { entries: LbEntry[]; category: CategoryDef }) {
  if (entries.length === 0) {
    return <StatusCard text={`No data yet for ${category.label}.`} />;
  }
  const cols = "32px 1fr 56px";
  return (
    <div className="border-t border-border">
      <div
        className="grid items-center px-2 py-3 text-muted-foreground"
        style={{
          gridTemplateColumns: cols,
          gap: "10px",
          fontSize: "11px",
          fontWeight: "var(--font-weight-medium)",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        <span>#</span>
        <span>Player</span>
        <span className="text-right pr-1">{category.metricLabel}</span>
      </div>

      {entries.map((e) => (
        <div
          key={e.playerId}
          className="grid items-center px-2 py-4 border-t border-border"
          style={{ gridTemplateColumns: cols, gap: "10px" }}
        >
          <span className="text-foreground text-center tabular-nums" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)" }}>
            {e.rank}
          </span>
          <div className="flex items-center gap-3 min-w-0">
            <Flag code={e.nationalityCode} name={e.teamName} size={24} />
            <div className="min-w-0">
              <p className="text-foreground truncate" style={{ fontSize: "var(--text-base)", fontWeight: "var(--font-weight-semibold)" }}>
                {e.name}
              </p>
              <p className="text-muted-foreground truncate" style={{ fontSize: "var(--text-xs)" }}>
                {e.teamName}
              </p>
            </div>
          </div>
          <span className="text-right pr-1 tabular-nums" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-weight-bold)", color: "var(--foreground)" }}>
            {e.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function StatusCard({ text }: { text: string }) {
  return (
    <div
      className="bg-card border border-border rounded-2xl px-4 py-10 text-center text-muted-foreground"
      style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)" }}
    >
      {text}
    </div>
  );
}

function CategoryPills({
  active,
  onChange,
}: {
  active: LbCategory;
  onChange: (id: LbCategory) => void;
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
  entries: LbEntry[];
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
          gridTemplateColumns: "24px 1fr 44px",
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
        <span className="text-right">{category.metricLabel}</span>
      </div>

      {entries.map((e) => (
        <div
          key={e.playerId}
          className="px-3 py-3 grid items-center border-t border-border"
          style={{
            gridTemplateColumns: "24px 1fr 44px",
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
            className="text-right tabular-nums"
            style={{
              fontSize: "var(--text-base)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--foreground)",
            }}
          >
            {e.value}
          </span>
        </div>
      ))}
    </div>
  );
}
