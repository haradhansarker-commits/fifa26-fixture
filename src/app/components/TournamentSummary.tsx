import { Link } from "react-router";
import { Flame, Trophy, Goal, CalendarDays } from "lucide-react";
import { Flag } from "./Flag";
import { useFixtures } from "../services/useLiveData";
import type { Match } from "../services/liveData";

// Compact tournament pulse: the live match (or the next one) plus a few
// headline numbers for FIFA World Cup 2026.
export function TournamentSummary() {
  const { data: matches } = useFixtures();
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
  );
}

function FeatureMatch({ match, live }: { match: Match; live: boolean }) {
  const showScore = match.status !== "upcoming";

  return (
    <Link to={`/match/${match.id}`} className="block px-4 pt-3 pb-4 hover:opacity-90 transition-opacity">
      <div className="flex items-center justify-between mb-3">
        {live ? (
          <span className="flex items-center gap-1.5" style={{ color: "#ef4444" }}>
            <span className="rounded-full" style={{ width: 7, height: 7, background: "#ef4444", animation: "pulse 1.4s ease-in-out infinite" }} />
            <span style={{ fontFamily: "Lexend, sans-serif", fontSize: "11px", fontWeight: "var(--font-weight-bold)", letterSpacing: "0.08em" }}>
              LIVE · {match.minute ?? 0}'
            </span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5" style={{ color: "var(--primary)" }}>
            <Flame size={13} />
            <span style={{ fontFamily: "Lexend, sans-serif", fontSize: "11px", fontWeight: "var(--font-weight-bold)", letterSpacing: "0.08em" }}>
              NEXT MATCH
            </span>
          </span>
        )}
        <span className="text-muted-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "11px" }}>
          {match.group ?? "Knockout"}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Side code={match.homeTeam.code} name={match.homeTeam.name} />

        <div className="flex flex-col items-center px-2 shrink-0">
          {showScore ? (
            <span className="text-foreground tabular-nums" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-2xl)", fontWeight: "var(--font-weight-bold)", lineHeight: 1 }}>
              {match.homeScore ?? 0}–{match.awayScore ?? 0}
            </span>
          ) : (
            <span className="text-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-lg)", fontWeight: "var(--font-weight-bold)", lineHeight: 1 }}>
              {match.time}
            </span>
          )}
          <span className="text-muted-foreground mt-1" style={{ fontFamily: "Lexend, sans-serif", fontSize: "10px" }}>
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
        style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)" }}
      >
        {name}
      </span>
    </div>
  );
}

function Stat({ icon, label, value, accent, divider }: { icon: React.ReactNode; label: string; value: string; accent: string; divider?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center py-3 gap-0.5 ${divider ? "border-x border-border" : ""}`}>
      <span style={{ color: accent, display: "inline-flex" }}>{icon}</span>
      <span className="text-foreground tabular-nums" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-base)", fontWeight: "var(--font-weight-bold)" }}>
        {value}
      </span>
      <span className="text-muted-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "10px", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </span>
    </div>
  );
}
