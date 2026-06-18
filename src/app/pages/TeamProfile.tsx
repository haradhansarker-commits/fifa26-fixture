import { useParams, Link } from "react-router";
import { Flag } from "../components/Flag";
import { FormBadges } from "../components/FormBadges";
import { PageHeader, SectionTitle } from "../components/PageHeader";
import { useTeamProfile } from "../services/useLiveData";
import type { Match } from "../services/liveData";

export function TeamProfile({ code: codeProp, inline }: { code?: string; inline?: boolean } = {}) {
  const params = useParams();
  const code = codeProp ?? params.code ?? "";
  const { data: profile, loading } = useTeamProfile(code);

  if (loading && !profile) {
    if (inline) {
      return (
        <p className="text-muted-foreground py-10 text-center" style={{ fontSize: "var(--text-sm)" }}>
          Loading team…
        </p>
      );
    }
    return (
      <>
        <PageHeader title="Team" />
        <main className="px-4 py-8">
          <p className="text-muted-foreground text-center" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)" }}>
            Loading team…
          </p>
        </main>
      </>
    );
  }

  if (!profile) {
    if (inline) {
      return (
        <p className="text-muted-foreground py-10 text-center" style={{ fontSize: "var(--text-sm)" }}>
          Team details unavailable.
        </p>
      );
    }
    return (
      <>
        <PageHeader title="Team not found" />
        <main className="px-4 py-5">
          <Link to="/" className="text-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)" }}>
            ← Back to fixtures
          </Link>
        </main>
      </>
    );
  }

  const { team, group, standing, matches } = profile;

  const content = (
    <>
        <section className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <Flag code={team.code} name={team.name} size={56} />
          <div className="flex-1 min-w-0">
            <p className="text-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-lg)", fontWeight: "var(--font-weight-semibold)" }}>
              {team.name}
            </p>
            <p className="text-muted-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-xs)" }}>
              {group ? `${group}${standing ? ` · ${ordinal(standing.position)} place` : ""}` : "Knockout stage"}
            </p>
          </div>
          {standing && standing.form.length > 0 && <FormBadges form={standing.form} size={20} />}
        </section>

        {standing && (
          <section className="flex flex-col gap-2">
            <SectionTitle>Group standing</SectionTitle>
            <div className="bg-card border border-border rounded-2xl px-4 py-4 grid grid-cols-7 gap-1 text-center">
              <Stat label="P" value={standing.played} />
              <Stat label="W" value={standing.won} />
              <Stat label="D" value={standing.drawn} />
              <Stat label="L" value={standing.lost} />
              <Stat label="GF" value={standing.gf} />
              <Stat label="GA" value={standing.ga} />
              <Stat label="Pts" value={standing.points} highlight />
            </div>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <SectionTitle>Fixtures</SectionTitle>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {matches.map((m, i) => (
              <Link
                key={m.id}
                to={`/match/${m.id}`}
                className={`block hover:bg-muted/40 transition-colors ${i > 0 ? "border-t border-border" : ""}`}
              >
                <FixtureRow match={m} teamCode={team.code} />
              </Link>
            ))}
          </div>
        </section>
    </>
  );

  // Inline mode (desktop standings right pane): own heading, no page chrome.
  if (inline) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-foreground truncate" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-weight-bold)" }}>
              {team.name}
            </h2>
            <p className="text-muted-foreground" style={{ fontSize: "var(--text-sm)" }}>
              {group ?? "Knockout stage"}
            </p>
          </div>
          {standing && standing.form.length > 0 && <FormBadges form={standing.form} size={18} />}
        </div>
        {content}
      </div>
    );
  }

  return (
    <>
      <PageHeader title={team.name} subtitle={group ?? "FIFA World Cup 2026"} />
      <main className="flex flex-col gap-5 px-4 pb-8">{content}</main>
    </>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="tabular-nums"
        style={{
          fontFamily: "Lexend, sans-serif",
          fontSize: "var(--text-base)",
          fontWeight: "var(--font-weight-bold)",
          color: highlight ? "var(--primary)" : "var(--foreground)",
        }}
      >
        {value}
      </span>
      <span className="text-muted-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "10px", letterSpacing: "0.04em" }}>
        {label}
      </span>
    </div>
  );
}

function FixtureRow({ match, teamCode }: { match: Match; teamCode: string }) {
  const isHome = match.homeTeam.code.toUpperCase() === teamCode.toUpperCase();
  const opponent = isHome ? match.awayTeam : match.homeTeam;
  const finished = match.status === "finished";
  const live = match.status === "live";

  let result: string | null = null;
  let resultColor = "var(--muted-foreground)";
  if (finished || live) {
    const own = isHome ? match.homeScore ?? 0 : match.awayScore ?? 0;
    const opp = isHome ? match.awayScore ?? 0 : match.homeScore ?? 0;
    result = `${own}–${opp}`;
    if (finished) resultColor = own > opp ? "var(--primary)" : own < opp ? "var(--chart-5)" : "var(--muted-foreground)";
    else resultColor = "#ef4444";
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-muted-foreground shrink-0" style={{ fontFamily: "Lexend, sans-serif", fontSize: "11px", minWidth: 52 }}>
        {match.dayLabel}
      </span>
      <span className="text-muted-foreground shrink-0" style={{ fontFamily: "Lexend, sans-serif", fontSize: "10px", width: 22 }}>
        {isHome ? "vs" : "@"}
      </span>
      <Flag code={opponent.code} name={opponent.name} size={20} />
      <span className="text-foreground truncate flex-1" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-medium)" }}>
        {opponent.name}
      </span>
      {result ? (
        <span className="tabular-nums shrink-0 flex items-center gap-1" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)", fontWeight: "var(--font-weight-bold)", color: resultColor }}>
          {live && <span className="rounded-full" style={{ width: 6, height: 6, background: "#ef4444", animation: "pulse 1.4s ease-in-out infinite" }} />}
          {result}
        </span>
      ) : (
        <span className="text-muted-foreground shrink-0" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-xs)" }}>
          {match.time}
        </span>
      )}
    </div>
  );
}
