import { useParams, Link } from "react-router";
import { Flag } from "../components/Flag";
import { PageHeader, SectionTitle } from "../components/PageHeader";
import { getPlayerById, getTeamByCode } from "../services/liveData";

const POSITION_LABEL: Record<string, string> = {
  GK: "Goalkeeper",
  DF: "Defender",
  MF: "Midfielder",
  FW: "Forward",
};

export function PlayerCard() {
  const { id = "" } = useParams();
  const player = getPlayerById(id);

  if (!player) {
    return (
      <>
        <PageHeader title="Player not found" />
        <main className="px-4 py-5">
          <Link to="/" className="text-foreground" style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)" }}>
            ← Back to fixtures
          </Link>
        </main>
      </>
    );
  }

  const team = getTeamByCode(player.nationalityCode);

  return (
    <>
      <PageHeader title={player.commonName} subtitle={POSITION_LABEL[player.position]} />
      <main className="flex flex-col gap-5 px-4 pb-8">
        <section className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
          <div
            className="bg-muted flex items-center justify-center text-foreground shrink-0"
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              fontFamily: "Lexend, sans-serif",
              fontSize: "var(--text-2xl)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            {player.jersey}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-foreground truncate"
              style={{
                fontFamily: "Lexend, sans-serif",
                fontSize: "var(--text-lg)",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {player.fullName}
            </p>
            <p
              className="text-muted-foreground"
              style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-xs)" }}
            >
              {POSITION_LABEL[player.position]} · {player.age}y · {player.heightCm} cm
            </p>
            {team && (
              <Link
                to={`/team/${team.code}`}
                className="mt-2 inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
              >
                <Flag code={team.code} name={team.name} size={18} />
                <span
                  className="text-foreground"
                  style={{
                    fontFamily: "Lexend, sans-serif",
                    fontSize: "var(--text-xs)",
                    fontWeight: "var(--font-weight-medium)",
                  }}
                >
                  {team.name}
                </span>
              </Link>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <SectionTitle>Tournament stats</SectionTitle>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Apps" value={player.stats.appearances} />
            <Stat label="Minutes" value={player.stats.minutes} />
            <Stat label="Goals" value={player.stats.goals} />
            <Stat label="Assists" value={player.stats.assists} />
            <Stat label="Yellow" value={player.stats.yellow} />
            <Stat label="Red" value={player.stats.red} />
          </div>
        </section>
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-3 flex flex-col">
      <span
        className="text-muted-foreground"
        style={{
          fontFamily: "Lexend, sans-serif",
          fontSize: "var(--text-xs)",
          fontWeight: "var(--font-weight-medium)",
        }}
      >
        {label}
      </span>
      <span
        className="text-foreground"
        style={{
          fontFamily: "Lexend, sans-serif",
          fontSize: "var(--text-lg)",
          fontWeight: "var(--font-weight-semibold)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
