import { useParams, Link } from "react-router";
import { useState, useEffect } from "react";
import { Goal, Flag as FlagIcon, RefreshCw, Square, MapPin, Tv, Youtube } from "lucide-react";
import { Flag } from "../components/Flag";
import { PageHeader } from "../components/PageHeader";
import { HighlightsModal } from "../components/HighlightsModal";
import { motion } from "motion/react";
import { useMatchDetail, useWatchLink, useHighlightLink } from "../services/useLiveData";
import type { MatchEvent, MatchStatLine, LineupPlayer } from "../services/liveData";
import { MatchDetailSkeleton } from "../components/Skeleton";

type SubTab = "lineups" | "events" | "stats";

const SUBTABS: { id: SubTab; label: string }[] = [
  { id: "lineups", label: "Lineups" },
  { id: "events", label: "Events" },
  { id: "stats", label: "Stats" },
];

export function MatchDetail({ id: idProp, inline }: { id?: string; inline?: boolean } = {}) {
  const params = useParams();
  const id = idProp ?? params.id ?? "";
  const { data, loading } = useMatchDetail(id);
  const watchUrl = useWatchLink(id);
  const highlight = useHighlightLink(id, data?.match.homeTeam.name, data?.match.awayTeam.name);
  const [tab, setTab] = useState<SubTab>("events");
  const [highlightsOpen, setHighlightsOpen] = useState(false);

  if (loading && !data) {
    if (inline) return <MatchDetailSkeleton />;
    return (
      <>
        <PageHeader title="Match" />
        <main className="pb-8">
          <MatchDetailSkeleton />
        </main>
      </>
    );
  }

  if (!data) {
    if (inline) {
      return (
        <p className="text-muted-foreground py-10 text-center" style={{ fontSize: "var(--text-sm)" }}>
          Match details unavailable.
        </p>
      );
    }
    return (
      <>
        <PageHeader title="Match not found" />
        <main className="px-4 py-5">
          <Link to="/" className="text-foreground" style={{ fontSize: "var(--text-sm)" }}>
            ← Back to fixtures
          </Link>
        </main>
      </>
    );
  }

  const { match, venue, homeFormation, awayFormation, homeLineup, awayLineup, events, stats } = data;
  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  const dateLong = new Date(match.startingAtISO).toLocaleString(undefined, {
    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
  });

  const content = (
    <>
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
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--primary-foreground)", animation: "pulse 1.4s ease-in-out infinite" }}
              />
              <Tv size={16} color="var(--primary-foreground)" strokeWidth={2} />
              <span style={{ color: "var(--primary-foreground)", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)" }}>
                Watch Live
              </span>
            </a>
          )}

          {/* Watch highlights — finished matches open the YouTube reel in-app */}
          {isFinished && (
            <button
              type="button"
              onClick={() => setHighlightsOpen(true)}
              className="flex items-center justify-center gap-2 w-full rounded-xl py-3 border border-border transition-colors hover:bg-muted outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Youtube size={16} style={{ color: "var(--live)" }} strokeWidth={2} aria-hidden />
              <span className="text-foreground" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)" }}>
                Watch highlights
              </span>
            </button>
          )}
        </section>

        {/* Sub-tabs */}
        <div
          className="flex items-center overflow-x-auto border-b border-border"
          style={{ scrollbarWidth: "none" } as React.CSSProperties}
        >
          {SUBTABS.map((s) => (
            <SubTabItem key={s.id} label={s.label} active={tab === s.id} onClick={() => setTab(s.id)} />
          ))}
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {tab === "lineups" && (
            <FormationPitch
              homeLineup={homeLineup}
              awayLineup={awayLineup}
              homeFormation={homeFormation}
              awayFormation={awayFormation}
              homeCode={match.homeTeam.code}
              awayCode={match.awayTeam.code}
              homeName={match.homeTeam.name}
              awayName={match.awayTeam.name}
            />
          )}
          {tab === "events" && <EventsList events={events} home={match.homeTeam.code} away={match.awayTeam.code} />}
          {tab === "stats" && (
            <StatsList
              stats={stats}
              homeCode={match.homeTeam.code}
              awayCode={match.awayTeam.code}
              homeName={match.homeTeam.name}
              awayName={match.awayTeam.name}
            />
          )}
        </motion.div>

        <HighlightsModal
          open={highlightsOpen}
          onClose={() => setHighlightsOpen(false)}
          title={`${match.homeTeam.name} ${match.homeScore ?? 0}–${match.awayScore ?? 0} ${match.awayTeam.name} · Highlights`}
          videoId={highlight.videoId}
          searchUrl={highlight.searchUrl}
        />
    </>
  );

  // Inline mode (desktop right pane): no page chrome, the pane owns the heading.
  if (inline) return <div className="flex flex-col gap-5">{content}</div>;

  return (
    <>
      <PageHeader title="Match" />
      <main className="flex flex-col gap-5 px-4 pb-8">{content}</main>
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

// Split 11 starters into formation lines: [GK, def, mid, ...] using the
// formation string (e.g. "4-2-3-1"); falls back to grouping by position.
function formationLines(players: LineupPlayer[], formation: string): LineupPlayer[][] {
  const gk = players.filter((p) => p.position === "GK");
  const outfield = players.filter((p) => p.position !== "GK");

  let counts = formation.split(/[^0-9]+/).filter(Boolean).map(Number);
  if (counts.length === 0 || counts.reduce((a, b) => a + b, 0) !== outfield.length) {
    counts = (["DF", "MF", "FW"] as const)
      .map((pos) => outfield.filter((p) => p.position === pos).length)
      .filter((n) => n > 0);
  }

  const lines: LineupPlayer[][] = gk.length ? [gk] : [];
  let i = 0;
  for (const c of counts) {
    lines.push(outfield.slice(i, i + c));
    i += c;
  }
  if (i < outfield.length) lines.push(outfield.slice(i));
  return lines;
}

// On tablet/desktop the pitch rotates 90° (landscape: home left, away right);
// on mobile it stays portrait (home top, away bottom).
function useIsWide(): boolean {
  const [wide, setWide] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => setWide(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return wide;
}

function FormationPitch({
  homeLineup, awayLineup, homeFormation, awayFormation, homeCode, awayCode, homeName, awayName,
}: {
  homeLineup: LineupPlayer[]; awayLineup: LineupPlayer[];
  homeFormation: string; awayFormation: string;
  homeCode: string; awayCode: string; homeName: string; awayName: string;
}) {
  const horizontal = useIsWide();

  if (homeLineup.length === 0 && awayLineup.length === 0) {
    return (
      <p className="text-muted-foreground px-1 py-8 text-center" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)" }}>
        Lineups not available yet.
      </p>
    );
  }

  const homeLines = formationLines(homeLineup, homeFormation);
  const awayLines = formationLines(awayLineup, awayFormation);

  const pitch = (
    <div
      className="relative w-full"
      style={{
        aspectRatio: horizontal ? "16 / 10" : "10 / 16",
        background: "repeating-radial-gradient(circle at 50% 50%, #3f9a45 0 34px, #3a9040 34px 68px)",
      }}
    >
      <PitchMarkings horizontal={horizontal} />
      {placeLines(homeLines, "home", horizontal)}
      {placeLines(awayLines, "away", horizontal)}
    </div>
  );

  if (horizontal) {
    // Both formation labels share one bar above the field.
    return (
      <div className="rounded-2xl overflow-hidden border border-border">
        <div className="flex items-center justify-between bg-card px-4 py-2.5">
          <FormationTag code={homeCode} name={homeName} formation={homeFormation} />
          <FormationTag code={awayCode} name={awayName} formation={awayFormation} align="right" />
        </div>
        {pitch}
      </div>
    );
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-border">
      <FormationBar code={homeCode} name={homeName} formation={homeFormation} />
      {pitch}
      <FormationBar code={awayCode} name={awayName} formation={awayFormation} />
    </div>
  );
}

// Place one team's lines as absolutely-positioned markers within its half.
function placeLines(lines: LineupPlayer[][], side: "home" | "away", horizontal: boolean) {
  const L = lines.length;
  return lines.flatMap((row, li) => {
    const t = L > 1 ? li / (L - 1) : 0; // 0 at GK edge → 1 toward halfway line
    const band = side === "home" ? 6 + t * 41 : 94 - t * 41; // outer edge → centre
    return row.map((p, i) => {
      const spread = ((i + 1) / (row.length + 1)) * 100;
      const x = horizontal ? band : spread;
      const y = horizontal ? spread : band;
      return <PlayerMarker key={p.playerId} player={p} x={x} y={y} side={side} />;
    });
  });
}

function PlayerMarker({ player, x, y, side }: { player: LineupPlayer; x: number; y: number; side: "home" | "away" }) {
  const home = side === "home";
  return (
    <div className="absolute flex flex-col items-center" style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)", width: 64 }}>
      <span
        className="inline-flex items-center justify-center rounded-full"
        style={{
          width: 34, height: 34,
          background: home ? "#ffffff" : "#15151a",
          color: home ? "#15151a" : "#ffffff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
          fontFamily: "Lexend, sans-serif", fontSize: "13px", fontWeight: "var(--font-weight-bold)",
        }}
      >
        {player.jersey}
      </span>
      <span
        className="mt-1 text-center truncate"
        style={{
          maxWidth: 64, color: "#ffffff",
          fontFamily: "Lexend, sans-serif", fontSize: "10px", fontWeight: "var(--font-weight-medium)",
          textShadow: "0 1px 2px rgba(0,0,0,0.85)",
        }}
      >
        {player.name}
      </span>
    </div>
  );
}

function FormationBar({ code, name, formation }: { code: string; name: string; formation: string }) {
  return (
    <div className="flex items-center justify-between bg-card px-4 py-2.5">
      <div className="flex items-center gap-2">
        <Flag code={code} name={name} size={22} />
        <span className="text-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)" }}>
          {code}
        </span>
      </div>
      {formation && (
        <span className="text-muted-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)", letterSpacing: "0.04em" }}>
          {formation}
        </span>
      )}
    </div>
  );
}

function FormationTag({ code, name, formation, align = "left" }: { code: string; name: string; formation: string; align?: "left" | "right" }) {
  return (
    <div className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}>
      <Flag code={code} name={name} size={22} />
      <span className="text-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)" }}>
        {code}
      </span>
      {formation && (
        <span className="text-muted-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)", letterSpacing: "0.04em" }}>
          {formation}
        </span>
      )}
    </div>
  );
}

function PitchMarkings({ horizontal }: { horizontal: boolean }) {
  const line = "rgba(255,255,255,0.55)";
  if (horizontal) {
    return (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden>
        <g fill="none" stroke={line} strokeWidth="0.5">
          <rect x="2" y="2" width="156" height="96" />
          <line x1="80" y1="2" x2="80" y2="98" />
          <circle cx="80" cy="50" r="13" />
          <circle cx="80" cy="50" r="0.8" fill={line} stroke="none" />
          {/* left box (home) */}
          <rect x="2" y="24" width="22" height="52" />
          <rect x="2" y="38" width="9" height="24" />
          {/* right box (away) */}
          <rect x="136" y="24" width="22" height="52" />
          <rect x="149" y="38" width="9" height="24" />
        </g>
      </svg>
    );
  }
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 160" preserveAspectRatio="none" aria-hidden>
      <g fill="none" stroke={line} strokeWidth="0.5">
        <rect x="2" y="2" width="96" height="156" />
        <line x1="2" y1="80" x2="98" y2="80" />
        <circle cx="50" cy="80" r="13" />
        <circle cx="50" cy="80" r="0.8" fill={line} stroke="none" />
        {/* top box */}
        <rect x="24" y="2" width="52" height="22" />
        <rect x="38" y="2" width="24" height="9" />
        {/* bottom box */}
        <rect x="24" y="136" width="52" height="22" />
        <rect x="38" y="149" width="24" height="9" />
      </g>
    </svg>
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

function StatsList({
  stats, homeCode, awayCode, homeName, awayName,
}: {
  stats: MatchStatLine[];
  homeCode: string; awayCode: string; homeName: string; awayName: string;
}) {
  if (stats.length === 0) {
    return (
      <p className="text-muted-foreground px-1 py-8 text-center" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)" }}>
        No stats available.
      </p>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl px-4 py-5 flex flex-col gap-5">
      {/* Section header with flags */}
      <div className="flex items-center justify-between">
        <FlagTag code={homeCode} name={homeName} />
        <h3
          className="text-foreground"
          style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-bold)", letterSpacing: "0.08em" }}
        >
          SUMMARY
        </h3>
        <FlagTag code={awayCode} name={awayName} />
      </div>

      <div className="flex flex-col gap-4">
        {stats.map((s) => (
          <StatBarRow key={s.label} stat={s} />
        ))}
      </div>
    </div>
  );
}

function FlagTag({ code, name }: { code: string; name: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Flag code={code} name={name} size={36} />
      <span className="text-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "11px", fontWeight: "var(--font-weight-semibold)", letterSpacing: "0.04em" }}>
        {code}
      </span>
    </div>
  );
}

function StatBarRow({ stat }: { stat: MatchStatLine }) {
  const { label, home, away, unit = "" } = stat;
  const max = Math.max(home, away);
  const homeFrac = max > 0 ? home / max : 0;
  const awayFrac = max > 0 ? away / max : 0;

  // The side ahead on this stat gets the primary colour.
  const homeLead = home > away;
  const awayLead = away > home;
  const homeColor = homeLead ? "var(--primary)" : "var(--foreground)";
  const awayColor = awayLead ? "var(--primary)" : "var(--foreground)";

  const valStyle = (color: string): React.CSSProperties => ({
    fontFamily: "Lexend, sans-serif",
    fontSize: "var(--text-base)",
    fontWeight: "var(--font-weight-bold)",
    color,
    fontVariantNumeric: "tabular-nums",
  });

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <span style={{ ...valStyle(homeColor), minWidth: 44, textAlign: "left" }}>{home}{unit}</span>
        <span
          className="text-muted-foreground text-center"
          style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)" }}
        >
          {label}
        </span>
        <span style={{ ...valStyle(awayColor), minWidth: 44, textAlign: "right" }}>{away}{unit}</span>
      </div>

      {/* Center-anchored bars: each side fills outward from the middle; the
          leading side is highlighted in the primary colour. */}
      <div className="flex items-center gap-1">
        <div className="flex-1 h-1.5 rounded-full relative overflow-hidden" style={{ background: "var(--muted)" }}>
          <div className="absolute right-0 top-0 h-full rounded-full" style={{ width: `${homeFrac * 100}%`, background: homeColor }} />
        </div>
        <div className="flex-1 h-1.5 rounded-full relative overflow-hidden" style={{ background: "var(--muted)" }}>
          <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${awayFrac * 100}%`, background: awayColor }} />
        </div>
      </div>
    </div>
  );
}

