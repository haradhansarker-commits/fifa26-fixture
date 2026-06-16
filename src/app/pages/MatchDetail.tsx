import { useParams, Link } from "react-router";
import { useState } from "react";
import { Goal, Flag as FlagIcon, RefreshCw, Square, MapPin, Tv } from "lucide-react";
import { Flag } from "../components/Flag";
import { PageHeader } from "../components/PageHeader";
import { useMatchDetail, useWatchLink } from "../services/useLiveData";
import type { MatchEvent, MatchStatLine } from "../services/liveData";

type SubTab = "lineups" | "events" | "stats" | "h2h";

const SUBTABS: { id: SubTab; label: string }[] = [
  { id: "lineups", label: "Lineups" },
  { id: "events", label: "Events" },
  { id: "stats", label: "Stats" },
  { id: "h2h", label: "H2H" },
];

export function MatchDetail() {
  const { id = "" } = useParams();
  const { data, loading } = useMatchDetail(id);
  const watchUrl = useWatchLink(id);
  const [tab, setTab] = useState<SubTab>("events");

  if (loading && !data) {
    return (
      <>
        <PageHeader title="Match" />
        <main className="px-4 py-8">
          <p className="text-muted-foreground text-center" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)" }}>
            Loading match…
          </p>
        </main>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <PageHeader title="Match not found" />
        <main className="px-4 py-5">
          <Link to="/" className="text-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)" }}>
            ← Back to fixtures
          </Link>
        </main>
      </>
    );
  }

  const { match, venue, homeFormation, awayFormation, homeLineup, awayLineup, events, stats, h2h } = data;
  const isLive = match.status === "live";

  const dateLong = new Date(match.startingAtISO).toLocaleString(undefined, {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });

  return (
    <>
      <PageHeader title="Match" />
      <main className="flex flex-col gap-5 px-4 pb-8">

        {/* Hero card */}
        <section className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <TeamBlock code={match.homeTeam.code} name={match.homeTeam.name} />
            <ScoreBlock
              status={match.status}
              home={match.homeScore}
              away={match.awayScore}
              kickoff={match.time}
              minute={match.minute}
            />
            <TeamBlock code={match.awayTeam.code} name={match.awayTeam.name} align="right" />
          </div>

          <div
            className="text-muted-foreground flex flex-col items-center gap-1"
            style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-xs)" }}
          >
            <span>{dateLong} · {match.group ?? "Knockout"}</span>
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {venue.name}, {venue.city}
            </span>
          </div>

          {/* Watch Live button — only shown when live + URL configured */}
          {isLive && watchUrl && (
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl py-3 transition-opacity active:opacity-80"
              style={{ background: "var(--primary)", fontFamily: "Lexend, sans-serif" }}
            >
              <span
                className="w-2 h-2 rounded-full bg-white"
                style={{ animation: "pulse 1.4s ease-in-out infinite" }}
              />
              <Tv size={16} color="white" strokeWidth={2} />
              <span style={{ color: "white", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)" }}>
                Watch Live
              </span>
            </a>
          )}
        </section>

        {/* Sub-tabs */}
        <div
          className="flex items-center overflow-x-auto -mx-4 px-4 border-b border-border"
          style={{ scrollbarWidth: "none" } as React.CSSProperties}
        >
          {SUBTABS.map((s) => (
            <SubTabItem key={s.id} label={s.label} active={tab === s.id} onClick={() => setTab(s.id)} />
          ))}
        </div>

        {tab === "lineups" && (
          <div className="grid grid-cols-2 gap-4">
            <LineupColumn teamName={match.homeTeam.name} teamCode={match.homeTeam.code} formation={homeFormation} players={homeLineup} />
            <LineupColumn teamName={match.awayTeam.name} teamCode={match.awayTeam.code} formation={awayFormation} players={awayLineup} align="right" />
          </div>
        )}
        {tab === "events" && <EventsList events={events} home={match.homeTeam.code} away={match.awayTeam.code} />}
        {tab === "stats"   && <StatsList stats={stats} />}
        {tab === "h2h"     && <H2H items={h2h} />}
      </main>
    </>
  );
}

function TeamBlock({ code, name, align = "left" }: { code: string; name: string; align?: "left" | "right" }) {
  return (
    <Link
      to={`/team/${code}`}
      className="flex-1 flex flex-col items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <Flag code={code} name={name} size={48} />
      <span
        className="text-foreground text-center"
        style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)" }}
      >
        {name}
      </span>
    </Link>
  );
}

function ScoreBlock({
  status, home, away, kickoff, minute,
}: {
  status: "upcoming" | "live" | "finished";
  home?: number;
  away?: number;
  kickoff: string;
  minute?: number;
}) {
  if (status === "upcoming") {
    return (
      <div className="flex flex-col items-center min-w-[80px] gap-0.5">
        <span
          className="text-foreground"
          style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-lg)", fontWeight: "var(--font-weight-semibold)" }}
        >
          {kickoff}
        </span>
        <span className="text-muted-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-xs)" }}>
          kickoff
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-w-[80px] gap-1">
      {status === "live" && (
        <div className="flex items-center gap-1.5">
          <span
            className="rounded-full"
            style={{ width: 8, height: 8, background: "#ef4444", animation: "pulse 1.4s ease-in-out infinite", display: "inline-block" }}
          />
          <span style={{ fontFamily: "Lexend, sans-serif", fontSize: "11px", fontWeight: "var(--font-weight-semibold)", color: "#ef4444" }}>
            {minute ?? 0}'
          </span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <span
          className="text-foreground"
          style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-2xl)", fontWeight: "var(--font-weight-bold)" }}
        >
          {home ?? 0}
        </span>
        <span className="text-muted-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-lg)" }}>–</span>
        <span
          className="text-foreground"
          style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-2xl)", fontWeight: "var(--font-weight-bold)" }}
        >
          {away ?? 0}
        </span>
      </div>
      {status === "finished" && (
        <span className="text-muted-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "11px", fontWeight: "var(--font-weight-medium)" }}>
          FT
        </span>
      )}
    </div>
  );
}

function SubTabItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="shrink-0 relative flex items-center justify-center">
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
          color: active ? "var(--foreground)" : "var(--muted-foreground)",
        }}
      >
        {label}
      </span>
    </button>
  );
}

function LineupColumn({
  teamName, teamCode, formation, players, align = "left",
}: {
  teamName: string; teamCode: string; formation: string;
  players: { playerId: string; jersey: number; name: string; position: string }[];
  align?: "left" | "right";
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-3 flex flex-col gap-2">
      <div className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse text-right" : ""}`}>
        <Flag code={teamCode} name={teamName} size={20} />
        <div className={`flex flex-col ${align === "right" ? "items-end" : ""}`}>
          <span className="text-foreground truncate" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-xs)", fontWeight: "var(--font-weight-semibold)" }}>
            {teamName}
          </span>
          <span className="text-muted-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "10px" }}>
            {formation}
          </span>
        </div>
      </div>
      <ul className="flex flex-col">
        {players.map((p) => (
          <li key={p.playerId} className={`py-1.5 flex items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}>
            <span
              className="inline-flex items-center justify-center bg-muted text-foreground shrink-0"
              style={{ width: 22, height: 22, borderRadius: 999, fontFamily: "Lexend, sans-serif", fontSize: "10px", fontWeight: "var(--font-weight-semibold)" }}
            >
              {p.jersey}
            </span>
            <span
              className="text-foreground truncate"
              style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-xs)", fontWeight: "var(--font-weight-medium)" }}
            >
              {p.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EventsList({ events, home, away }: { events: MatchEvent[]; home: string; away: string }) {
  if (events.length === 0) {
    return (
      <p className="text-muted-foreground px-1" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)" }}>
        No events yet.
      </p>
    );
  }
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {events.map((e, i) => (
        <div
          key={e.id}
          className={`px-4 py-3 flex items-center gap-3 ${i > 0 ? "border-t border-border" : ""} ${e.teamSide === "away" ? "flex-row-reverse text-right" : ""}`}
        >
          <span className="text-muted-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-xs)", minWidth: 28, textAlign: "center" }}>
            {e.minute}'
          </span>
          <EventIcon type={e.type} />
          <div className="flex-1 min-w-0">
            <p className="text-foreground truncate" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)" }}>
              {e.playerName}
            </p>
            {e.detail && (
              <p className="text-muted-foreground truncate" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-xs)" }}>
                {e.detail}
              </p>
            )}
          </div>
          <span className="text-muted-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "10px" }}>
            {e.teamSide === "home" ? home : away}
          </span>
        </div>
      ))}
    </div>
  );
}

function EventIcon({ type }: { type: MatchEvent["type"] }) {
  switch (type) {
    case "goal":   return <Goal size={16} className="text-foreground" />;
    case "yellow": return <Square size={14} fill="#ffd60a" strokeWidth={0} />;
    case "red":    return <Square size={14} fill="#ff453a" strokeWidth={0} />;
    case "sub":    return <RefreshCw size={14} className="text-muted-foreground" />;
    default:       return <FlagIcon size={14} />;
  }
}

function StatsList({ stats }: { stats: MatchStatLine[] }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
      {stats.map((s) => {
        const total = s.home + s.away;
        const homePct = total === 0 ? 50 : (s.home / total) * 100;
        return (
          <div key={s.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-xs)", fontWeight: "var(--font-weight-medium)" }}>
              <span className="text-foreground">{s.home}{s.unit ?? ""}</span>
              <span className="text-muted-foreground">{s.label}</span>
              <span className="text-foreground">{s.away}{s.unit ?? ""}</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden flex">
              <div style={{ width: `${homePct}%`, background: "var(--primary)" }} />
              <div className="bg-foreground/40 flex-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function H2H({ items }: { items: { date: string; home: { name: string; code: string }; away: { name: string; code: string }; homeScore: number; awayScore: number }[] }) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {items.map((h, i) => (
        <div key={i} className={`px-4 py-3 flex items-center gap-3 ${i > 0 ? "border-t border-border" : ""}`}>
          <span className="text-muted-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-xs)", minWidth: 76 }}>
            {h.date}
          </span>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <Flag code={h.home.code} name={h.home.name} size={18} />
            <span className="text-foreground truncate" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-xs)", fontWeight: "var(--font-weight-medium)" }}>
              {h.home.name}
            </span>
          </div>
          <span className="text-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)" }}>
            {h.homeScore} – {h.awayScore}
          </span>
          <div className="flex-1 flex items-center gap-2 min-w-0 flex-row-reverse text-right">
            <Flag code={h.away.code} name={h.away.name} size={18} />
            <span className="text-foreground truncate" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-xs)", fontWeight: "var(--font-weight-medium)" }}>
              {h.away.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
