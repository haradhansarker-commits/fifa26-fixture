import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Flame, Trophy, Goal, CalendarDays } from "lucide-react";
import { Flag } from "./Flag";
import { useFixtures } from "../services/useLiveData";
import type { Match } from "../services/liveData";
import { SummarySkeleton } from "./Skeleton";

// Compact tournament pulse: the live match (or the next one) plus a few
// headline numbers for FIFA World Cup 2026.
export function TournamentSummary() {
  const { data: matches, loading, updatedAt } = useFixtures();
  if (loading && matches.length === 0) return <SummarySkeleton />;
  if (matches.length === 0) return null;

  const live = matches.find((m) => m.status === "live");
  const next = matches.find((m) => m.status === "upcoming");
  const feature = live ?? next;

  const finished = matches.filter((m) => m.status === "finished");
  const played = finished.length;
  const total = matches.length;
  const goals = finished.reduce((n, m) => n + (m.homeScore ?? 0) + (m.awayScore ?? 0), 0);
  const avg = played ? (goals / played).toFixed(1) : "0.0";

  return (
    <div className="flex flex-col gap-2">
      <div
        className="rounded-2xl border border-border overflow-hidden"
        style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 10%, var(--card)), var(--card) 55%)" }}
      >
        {feature && <FeatureMatch match={feature} live={!!live} />}

        <div className="grid grid-cols-3 border-t border-border">
          <Stat icon={<Trophy size={14} />} label="Played" value={`${played}/${total}`} accent="var(--primary)" />
          <Stat icon={<Goal size={14} />} label="Goals" value={String(goals)} accent="var(--secondary)" divider />
          <Stat icon={<CalendarDays size={14} />} label="Goals/match" value={avg} accent="var(--primary)" />
        </div>
      </div>

      <LastUpdated ts={updatedAt} />
    </div>
  );
}

function LastUpdated({ ts }: { ts: number | null }) {
  const rel = useRelativeTime(ts);
  if (!rel) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-1.5 text-muted-foreground"
      style={{ fontSize: "var(--text-xs)" }}
    >
      <span
        aria-hidden
        className="rounded-full"
        style={{ width: 5, height: 5, background: "var(--primary)", display: "inline-block" }}
      />
      Updated {rel}
    </div>
  );
}

/** Ticks a relative label ("just now", "2 min ago") off a timestamp. */
function useRelativeTime(ts: number | null): string {
  const [, force] = useState(0);
  useEffect(() => {
    if (ts == null) return;
    const t = setInterval(() => force((n) => n + 1), 15_000);
    return () => clearInterval(t);
  }, [ts]);

  if (ts == null) return "";
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  return `${Math.round(m / 60)} h ago`;
}

function Stat({ icon, label, value, accent, divider }: { icon: React.ReactNode; label: string; value: string; accent: string; divider?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center py-3 gap-0.5 ${divider ? "border-x border-border" : ""}`}>
      <span style={{ color: accent, display: "inline-flex" }}>{icon}</span>
      <span className="text-foreground tabular-nums" style={{ fontSize: "var(--text-base)", fontWeight: "var(--font-weight-bold)" }}>
        {value}
      </span>
      <span className="text-muted-foreground" style={{ fontSize: "10px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </span>
    </div>
  );
}

function FeatureMatch({ match, live }: { match: Match; live: boolean }) {
  const showScore = match.status !== "upcoming";

  return (
    <Link to={`/match/${match.id}`} className="block px-4 pt-3 pb-4 hover:opacity-90 transition-opacity">
      <div className="flex items-center justify-between mb-3">
        {live ? (
          <span className="flex items-center gap-1.5" style={{ color: "var(--live)" }}>
            <span className="rounded-full" style={{ width: 7, height: 7, background: "var(--live)", animation: "pulse 1.4s ease-in-out infinite" }} />
            <span style={{ fontSize: "11px", fontWeight: "var(--font-weight-bold)", letterSpacing: "0.08em" }}>
              LIVE · {match.minute ?? 0}'
            </span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5" style={{ color: "var(--primary)" }}>
            <Flame size={13} />
            <span style={{ fontSize: "11px", fontWeight: "var(--font-weight-bold)", letterSpacing: "0.08em" }}>
              NEXT MATCH
            </span>
          </span>
        )}
        <span className="text-muted-foreground" style={{ fontSize: "11px" }}>
          {match.group ?? "Knockout"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Side code={match.homeTeam.code} name={match.homeTeam.name} />

        <div className="flex flex-col items-center px-2 shrink-0">
          {showScore ? (
            <span className="text-foreground tabular-nums" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-weight-bold)", lineHeight: 1 }}>
              {match.homeScore ?? 0}–{match.awayScore ?? 0}
            </span>
          ) : (
            <span className="text-foreground" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-weight-bold)", lineHeight: 1 }}>
              {match.time}
            </span>
          )}
          <span className="text-muted-foreground mt-1" style={{ fontSize: "10px" }}>
            {match.dayLabel}
          </span>
        </div>

        <Side code={match.awayTeam.code} name={match.awayTeam.name} align="right" />
      </div>
    </Link>
  );
}

function Side({ code, name, align = "left" }: { code: string; name: string; align?: "left" | "right" }) {
  return (
    <div className={`flex-1 min-w-0 flex items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}>
      <Flag code={code} name={name} size={30} />
      <span
        className="text-foreground truncate"
        style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)" }}
      >
        {name}
      </span>
    </div>
  );
}
