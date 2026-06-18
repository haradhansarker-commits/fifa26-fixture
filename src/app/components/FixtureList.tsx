import { Fragment, useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { CalendarSearch, RotateCw, WifiOff } from "lucide-react";
import { Flag } from "./Flag";
import { type Match } from "../services/liveData";
import { useFixtures } from "../services/useLiveData";
import { FixtureListSkeleton } from "./Skeleton";

/** On desktop the list drives a side-by-side detail pane instead of navigating;
 *  when this is null (mobile) rows fall back to route links. */
export type Selection = { selectedId?: string; onSelect: (id: string) => void } | null;

export function FixtureList({ selection = null }: { selection?: Selection }) {
  const { data: allMatches, loading, error, refetch } = useFixtures();
  const [searchParams, setSearchParams] = useSearchParams();

  const grouped = allMatches.reduce<Record<string, { dayLabel: string; items: Match[] }>>((acc, m) => {
    if (!acc[m.date]) acc[m.date] = { dayLabel: m.dayLabel, items: [] };
    acc[m.date].items.push(m);
    return acc;
  }, {});

  const days = Object.keys(grouped).sort();
  const liveMatches = allMatches.filter((m) => m.status === "live");

  // Default to today's fixtures (or the next match day) on first entry; the
  // chosen day is mirrored in the ?day= param so it survives back-navigation.
  const todayKey = new Date().toLocaleDateString("en-CA");
  const defaultDay = days.includes(todayKey) ? todayKey : days.find((d) => d >= todayKey) ?? "all";
  const dayParam = searchParams.get("day");
  const selectedDay = dayParam && (dayParam === "all" || days.includes(dayParam)) ? dayParam : defaultDay;

  const selectDay = (key: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("day", key);
        return next;
      },
      { replace: true },
    );
  };

  const visibleDays = selectedDay === "all" ? days : days.filter((d) => d === selectedDay);

  if (loading && allMatches.length === 0) return <FixtureListSkeleton />;
  if (error && allMatches.length === 0) return <ErrorState onRetry={refetch} />;

  return (
    <div className="flex flex-col gap-5">
      <LiveNow matches={liveMatches} selection={selection} />

      <DateScrubber days={days} grouped={grouped} selected={selectedDay} onSelect={selectDay} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={selectedDay}
          className="flex flex-col gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {visibleDays.length === 0 && <EmptyDay onShowAll={() => selectDay("all")} />}

          {visibleDays.map((day) => (
            <section key={day} className="flex flex-col gap-2">
              <h2
                className="text-muted-foreground px-1"
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: "var(--font-weight-semibold)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {grouped[day].dayLabel}
              </h2>

              <MatchCard matches={grouped[day].items} selection={selection} />
            </section>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** A bordered card of match rows with hairline dividers — shared by day groups
 *  and the pinned live section. */
function MatchCard({ matches, accent, selection }: { matches: Match[]; accent?: boolean; selection?: Selection }) {
  return (
    <div
      className="bg-card rounded-2xl overflow-hidden border"
      style={
        accent
          ? { borderColor: "color-mix(in srgb, var(--live) 45%, var(--border))" }
          : { borderColor: "var(--border)" }
      }
    >
      {matches.map((match, i) => (
        <Fragment key={match.id}>
          {i > 0 && <div className="h-px bg-border mx-4" />}
          {selection ? (
            <button
              type="button"
              onClick={() => selection.onSelect(match.id)}
              aria-current={selection.selectedId === match.id ? "true" : undefined}
              className={`block w-full text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${
                selection.selectedId === match.id ? "bg-muted" : "hover:bg-muted/40"
              }`}
            >
              <MatchRow match={match} />
            </button>
          ) : (
            <Link to={`/match/${match.id}`} className="block hover:bg-muted/40 transition-colors">
              <MatchRow match={match} />
            </Link>
          )}
        </Fragment>
      ))}
    </div>
  );
}

/** Live matches pinned above the day list so the one match a fan came to watch
 *  is never buried in a long group or hidden behind another selected day. */
function LiveNow({ matches, selection }: { matches: Match[]; selection?: Selection }) {
  if (matches.length === 0) return null;
  return (
    <section aria-label="Live matches now" className="flex flex-col gap-2">
      <div className="flex items-center gap-2 px-1">
        <span
          aria-hidden
          className="rounded-full"
          style={{ width: 7, height: 7, background: "var(--live)", animation: "pulse 1.4s ease-in-out infinite" }}
        />
        <h2
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: "var(--font-weight-bold)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--live)",
          }}
        >
          Live now
        </h2>
        <span className="text-muted-foreground" style={{ fontSize: "var(--text-xs)" }}>
          {matches.length} {matches.length === 1 ? "match" : "matches"}
        </span>
      </div>
      <MatchCard matches={matches} accent selection={selection} />
    </section>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-14 px-6 text-center">
      <WifiOff size={28} className="text-muted-foreground" aria-hidden />
      <div className="flex flex-col gap-1">
        <p className="text-foreground" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)" }}>
          Couldn’t reach FIFA’s live data
        </p>
        <p className="text-muted-foreground" style={{ fontSize: "var(--text-xs)" }}>
          We’ll keep retrying on our own — or try again now.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{
          background: "var(--primary)",
          color: "var(--primary-foreground)",
          fontSize: "var(--text-sm)",
          fontWeight: "var(--font-weight-semibold)",
        }}
      >
        <RotateCw size={15} aria-hidden />
        Retry now
      </button>
    </div>
  );
}

function EmptyDay({ onShowAll }: { onShowAll: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12 px-6 text-center">
      <CalendarSearch size={26} className="text-muted-foreground" aria-hidden />
      <p className="text-foreground" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)" }}>
        No matches on this day
      </p>
      <button
        type="button"
        onClick={onShowAll}
        className="rounded-full border border-border px-4 py-2 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--foreground)" }}
      >
        View all fixtures
      </button>
    </div>
  );
}

function DateScrubber({
  days,
  grouped,
  selected,
  onSelect,
}: {
  days: string[];
  grouped: Record<string, { dayLabel: string; items: Match[] }>;
  selected: string;
  onSelect: (day: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Instagram-dot move motion: chips scale + fade by their distance from the
  // strip's centre, so the focused day grows while neighbours recede.
  const applyScale = () => {
    const el = scrollRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    for (const child of Array.from(el.children) as HTMLElement[]) {
      const c = child.offsetLeft + child.offsetWidth / 2;
      const max = el.clientWidth / 2 + child.offsetWidth;
      const t = Math.min(1, Math.abs(c - center) / max);
      child.style.transform = `scale(${1 - t * 0.34})`;
      child.style.opacity = String(1 - t * 0.55);
    }
  };

  // Recompute on scroll (rAF-throttled).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(applyScale);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    applyScale();
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Slowly glide the selected chip to the centre with a custom tween (the native
  // "smooth" behaviour is too fast); scaling follows along each frame.
  useEffect(() => {
    const el = scrollRef.current;
    const a = activeRef.current;
    if (!el || !a) return;

    const from = el.scrollLeft;
    const to = a.offsetLeft + a.offsetWidth / 2 - el.clientWidth / 2;
    const dist = to - from;
    if (Math.abs(dist) < 1) {
      applyScale();
      return;
    }

    const DURATION = 650; // ms
    const start = performance.now();
    let raf = 0;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION);
      el.scrollLeft = from + dist * easeOutCubic(p);
      applyScale();
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, days.length]);

  const chips: { key: string; weekday: string; day: string; count: number | null; label: string }[] = [
    { key: "all", weekday: "All", day: "", count: null, label: "All fixtures" },
    ...days.map((d) => {
      const [year, month, day] = d.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      const count = grouped[d].items.length;
      return {
        key: d,
        weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
        day: date.toLocaleDateString(undefined, { day: "2-digit" }),
        count,
        label: `${date.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}, ${count} ${count === 1 ? "match" : "matches"}`,
      };
    }),
  ];

  return (
    <div
      ref={scrollRef}
      role="group"
      aria-label="Filter fixtures by day"
      className="flex items-stretch gap-2 overflow-x-auto -mx-4 px-4 pb-1"
      style={{ scrollbarWidth: "none" }}
    >
      {chips.map((chip) => {
        const active = selected === chip.key;
        const isAll = chip.key === "all";
        return (
          <button
            key={chip.key}
            type="button"
            ref={active ? activeRef : undefined}
            onClick={() => onSelect(chip.key)}
            aria-pressed={active}
            aria-label={chip.label}
            className={`relative shrink-0 flex flex-col items-center justify-center rounded-2xl border min-w-[56px] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              active ? "border-primary" : "border-border bg-card hover:bg-muted"
            }`}
            style={{ color: active ? "var(--primary-foreground)" : "var(--foreground)" }}
          >
            {active && (
              <motion.span
                layoutId="dayPill"
                aria-hidden
                className="absolute inset-0 rounded-2xl"
                style={{ background: "var(--primary)" }}
                transition={{ type: "spring", stiffness: 260, damping: 30, mass: 0.9 }}
              />
            )}
            <span
              className="relative"
              style={{
                fontSize: "var(--text-xs)",
                fontWeight: "var(--font-weight-medium)",
                opacity: active ? 0.92 : 0.78,
              }}
            >
              {chip.weekday}
            </span>
            {!isAll && (
              <span
                className="relative"
                style={{
                  fontSize: "var(--text-lg)",
                  fontWeight: "var(--font-weight-semibold)",
                  lineHeight: 1.1,
                }}
              >
                {chip.day}
              </span>
            )}
            {chip.count !== null && (
              <span
                className="relative"
                style={{
                  fontSize: "10px",
                  fontWeight: "var(--font-weight-medium)",
                  opacity: active ? 0.9 : 0.75,
                }}
              >
                {chip.count} {chip.count === 1 ? "match" : "matches"}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function MatchRow({ match }: { match: Match }) {
  const isLive = match.status === "live";
  const finished = match.status === "finished";
  const homeWon = finished && (match.homeScore ?? 0) > (match.awayScore ?? 0);
  const awayWon = finished && (match.awayScore ?? 0) > (match.homeScore ?? 0);
  const hasScore = match.homeScore !== undefined && match.awayScore !== undefined;

  return (
    <div className="flex items-center gap-4 p-4">
      {/* Time / live indicator column */}
      <div className="flex flex-col items-center justify-center gap-0.5 shrink-0 w-[52px]">
        {isLive ? (
          <>
            <div className="flex items-center gap-1">
              <span
                className="rounded-full shrink-0"
                style={{ width: 6, height: 6, background: "var(--live)", display: "inline-block", animation: "pulse 1.4s ease-in-out infinite" }}
              />
              <span style={{ fontSize: "11px", fontWeight: "var(--font-weight-bold)", color: "var(--live)" }}>
                {match.minute ?? 0}'
              </span>
            </div>
            <span style={{ fontSize: "10px", color: "var(--live)", fontWeight: "var(--font-weight-semibold)" }}>
              LIVE
            </span>
          </>
        ) : (
          <>
            <span
              className="text-foreground"
              style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)", lineHeight: "21px" }}
            >
              {match.time}
            </span>
            {match.group && (
              <span
                className="text-muted-foreground"
                style={{ fontSize: "var(--text-xs)", fontWeight: "var(--font-weight-normal)", lineHeight: "18px" }}
              >
                {match.group}
              </span>
            )}
          </>
        )}
      </div>

      <div className="w-px self-stretch bg-border shrink-0" />

      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <TeamRow team={match.homeTeam} score={match.homeScore} dim={awayWon} isLive={isLive} />
        <TeamRow team={match.awayTeam} score={match.awayScore} dim={homeWon} isLive={isLive} />
      </div>

      {!hasScore && (
        <span className="text-muted-foreground shrink-0" style={{ fontSize: "var(--text-xs)" }}>—</span>
      )}
    </div>
  );
}

function TeamRow({
  team,
  score,
  dim,
  isLive,
}: {
  team: { name: string; code: string };
  score?: number;
  dim?: boolean;
  isLive?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 min-w-0" style={{ opacity: dim ? 0.55 : 1 }}>
      <Flag code={team.code} name={team.name} size={28} />
      <span
        className="text-foreground truncate"
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: "var(--font-weight-medium)",
          lineHeight: "21px",
        }}
      >
        {team.name}
      </span>
      {score !== undefined && (
        <span
          className="ml-auto shrink-0 tabular-nums"
          style={{
            fontSize: "var(--text-lg)",
            fontWeight: "var(--font-weight-bold)",
            lineHeight: 1,
            color: isLive ? "var(--live)" : "var(--foreground)",
          }}
        >
          {score}
        </span>
      )}
    </div>
  );
}
