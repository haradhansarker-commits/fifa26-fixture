import { Fragment } from "react";
import { Link } from "react-router";
import { Trophy, Medal, Swords, Crown } from "lucide-react";
import { Flag } from "./Flag";
import { type KnockoutMatch, type KnockoutSide } from "../services/liveData";
import { useKnockout } from "../services/useLiveData";
import { BracketSkeleton } from "./Skeleton";
import type { Selection } from "./FixtureList";

function roundIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes("final") && !t.includes("semi") && !t.includes("quarter") && !t.includes("third") && !t.includes("play")) return Crown;
  if (t.includes("semi")) return Trophy;
  if (t.includes("quarter")) return Medal;
  return Swords;
}

export function KnockoutBracket({ selection = null }: { selection?: Selection } = {}) {
  const { data: rounds, loading, error } = useKnockout();

  if (loading && rounds.length === 0) return <BracketSkeleton />;
  if (error && rounds.length === 0)
    return <p className="text-muted-foreground px-1 py-8 text-center" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)" }}>Could not load bracket from FIFA. Retrying…</p>;

  // Rail (desktop master-detail) stacks rounds in one column; full-width view
  // spreads them across a responsive grid.
  return (
    <div className={selection ? "flex flex-col gap-6" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start"}>
      {rounds.map((round) => {
        const Icon = roundIcon(round.title);
        return (
        <section key={round.id} className="flex flex-col gap-2">
          <h2
            className="flex items-center gap-1.5 text-muted-foreground px-1"
            style={{
              fontSize: "var(--text-xs)",
              fontWeight: "var(--font-weight-semibold)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontFamily: "Lexend, sans-serif",
            }}
          >
            <Icon size={14} strokeWidth={1.75} />
            {round.title}
          </h2>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {round.matches.map((m, i) => (
              <Fragment key={m.id}>
                {i > 0 && <div className="h-px bg-border mx-4" />}
                {m.matchId && selection ? (
                  <button
                    type="button"
                    onClick={() => selection.onSelect(m.matchId!)}
                    aria-current={selection.selectedId === m.matchId ? "true" : undefined}
                    className={`block w-full text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${
                      selection.selectedId === m.matchId ? "bg-muted" : "hover:bg-muted/40"
                    }`}
                  >
                    <BracketRow match={m} />
                  </button>
                ) : m.matchId ? (
                  <Link to={`/match/${m.matchId}`} className="block hover:bg-muted/40 transition-colors">
                    <BracketRow match={m} />
                  </Link>
                ) : (
                  <BracketRow match={m} />
                )}
              </Fragment>
            ))}
          </div>
        </section>
        );
      })}
    </div>
  );
}

function BracketRow({ match }: { match: KnockoutMatch }) {
  return (
    <div className="px-4 py-4 flex items-center gap-4">
      <div className="flex flex-col items-center justify-center min-w-[52px] gap-1">
        <span
          className="text-foreground"
          style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-semibold)" }}
        >
          {match.date.split(" ")[0]}
        </span>
        <span className="text-muted-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-xs)" }}>
          {match.date.split(" ")[1]}
        </span>
      </div>

      <div className="w-px self-stretch bg-border" />

      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <SideRow side={match.home} />
        <SideRow side={match.away} />
      </div>
    </div>
  );
}

function SideRow({ side }: { side: KnockoutSide }) {
  if (!side) {
    return (
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="bg-muted shrink-0"
          style={{ width: 24, height: 24, borderRadius: 4, opacity: 0.6 }}
        />
        <span
          className="text-muted-foreground truncate"
          style={{ fontSize: "var(--text-sm)" }}
        >
          TBD
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 min-w-0">
      <Flag code={side.code} name={side.name} size={24} />
      <span
        className="text-foreground truncate"
        style={{
          fontSize: "var(--text-sm)",
          fontWeight: side.winner
            ? "var(--font-weight-semibold)"
            : "var(--font-weight-medium)",
        }}
      >
        {side.name}
      </span>
      {side.score !== undefined && (
        <span
          className="ml-auto inline-flex items-center justify-center rounded-md px-2 py-0.5 min-w-[24px]"
          style={{
            fontFamily: "Lexend, sans-serif",
            fontSize: "var(--text-sm)",
            fontWeight: "var(--font-weight-bold)",
            background: side.winner ? "var(--secondary)" : "var(--muted)",
            color: "var(--secondary-foreground)",
          }}
        >
          {side.score}
        </span>
      )}
    </div>
  );
}
