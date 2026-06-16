import { useParams, Link } from "react-router";
import { Flag } from "../components/Flag";
import { FormBadges } from "../components/FormBadges";
import { PageHeader, SectionTitle } from "../components/PageHeader";
import { getTeamProfile, type Player } from "../services/liveData";

export function TeamProfile() {
  const { code = "" } = useParams();
  const profile = getTeamProfile(code);

  if (!profile) {
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

  const { team, formation, recentForm, squad } = profile;
  const byPosition: Record<string, Player[]> = { GK: [], DF: [], MF: [], FW: [] };
  squad.forEach((p) => byPosition[p.position].push(p));

  return (
    <>
      <PageHeader title={team.name} subtitle="Team profile" />
      <main className="flex flex-col gap-5 px-4 pb-8">
        <section className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <Flag code={team.code} name={team.name} size={56} />
          <div className="flex-1 min-w-0">
            <p
              className="text-foreground"
              style={{
                fontFamily: "Lexend, sans-serif",
                fontSize: "var(--text-lg)",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {team.name}
            </p>
            <p
              className="text-muted-foreground"
              style={{
                fontFamily: "Lexend, sans-serif",
                fontSize: "var(--text-xs)",
              }}
            >
              Formation · {formation}
            </p>
          </div>
        </section>

        <section className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
          <span
            className="text-muted-foreground"
            style={{
              fontFamily: "Lexend, sans-serif",
              fontSize: "var(--text-xs)",
              fontWeight: "var(--font-weight-medium)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Recent form
          </span>
          <FormBadges form={recentForm} size={20} />
        </section>

        <section className="flex flex-col gap-2">
          <SectionTitle>Squad</SectionTitle>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {(["GK", "DF", "MF", "FW"] as const).flatMap((pos, gi) =>
              byPosition[pos].map((p, i) => (
                <div
                  key={p.id}
                  className={`px-4 py-3 flex items-center gap-3 ${
                    gi === 0 && i === 0 ? "" : "border-t border-border"
                  }`}
                >
                  <span
                    className="inline-flex items-center justify-center bg-muted text-foreground shrink-0"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 999,
                      fontFamily: "Lexend, sans-serif",
                      fontSize: "var(--text-xs)",
                      fontWeight: "var(--font-weight-semibold)",
                    }}
                  >
                    {p.jersey}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-foreground truncate"
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontSize: "var(--text-sm)",
                        fontWeight: "var(--font-weight-medium)",
                      }}
                    >
                      {p.commonName}
                    </p>
                    <p
                      className="text-muted-foreground"
                      style={{
                        fontFamily: "Lexend, sans-serif",
                        fontSize: "var(--text-xs)",
                      }}
                    >
                      {p.position} · #{p.jersey}
                    </p>
                  </div>
                  <span
                    className="text-muted-foreground"
                    style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-xs)" }}
                  >
                    {p.stats.goals}G · {p.stats.assists}A
                  </span>
                </div>
              )),
            )}
            {squad.length === 0 && (
              <p
                className="px-4 py-6 text-muted-foreground"
                style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)" }}
              >
                Squad data not yet available.
              </p>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
