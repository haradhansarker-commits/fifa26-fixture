import { Link } from "react-router";
import { Trophy } from "lucide-react";
import { Flag } from "./Flag";
import { FormBadges } from "./FormBadges";
import { type GroupData } from "../services/liveData";
import { useStandings } from "../services/useLiveData";
import { StandingsSkeleton } from "./Skeleton";

export function LeaderboardTable() {
  const { data: groups, loading, error } = useStandings();

  if (loading && groups.length === 0) return <StandingsSkeleton />;
  if (error && groups.length === 0) return <Note text="Could not load standings from FIFA. Retrying…" />;

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <GroupTable key={group.name} group={group} />
      ))}
    </div>
  );
}

function Note({ text }: { text: string }) {
  return (
    <p
      className="text-muted-foreground px-1 py-8 text-center"
      style={{ fontFamily: "Lexend, sans-serif", fontSize: "var(--text-sm)" }}
    >
      {text}
    </p>
  );
}

function rankColor(position: number, total: number): string {
  if (position <= 2) return "#22c55e";
  if (position === total) return "var(--chart-5)";
  return "var(--chart-3)";
}

function GroupTable({ group }: { group: GroupData }) {
  const total = group.teams.length;
  const maxAbsGD = Math.max(
    1,
    ...group.teams.map((t) => Math.abs(t.gf - t.ga)),
  );

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <h2
          className="text-muted-foreground"
          style={{
            fontFamily: "Lexend, sans-serif",
            fontSize: "var(--text-xs)",
            fontWeight: "var(--font-weight-semibold)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {group.name}
        </h2>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Trophy size={12} strokeWidth={1.75} />
          <span
            style={{
              fontFamily: "Lexend, sans-serif",
              fontSize: "var(--text-xs)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            {group.teams[0]?.name}
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse" style={{ fontFamily: "Lexend, sans-serif" }}>
          <thead>
            <tr
              className="text-muted-foreground"
              style={{ fontSize: "var(--text-xs)", fontWeight: "var(--font-weight-medium)" }}
            >
              <th className="pl-4 pr-1 py-3 w-8">#</th>
              <th className="px-2 py-3">Team</th>
              <Th>P</Th>
              <Th hideOnMobile>W</Th>
              <Th hideOnMobile>D</Th>
              <Th hideOnMobile>L</Th>
              <th
                className="hidden sm:table-cell px-2 py-3 text-left"
                style={{ fontSize: "var(--text-xs)", fontWeight: "var(--font-weight-medium)" }}
              >
                GD
              </th>
              <th
                className="hidden sm:table-cell px-2 py-3 text-center text-foreground"
                style={{ fontSize: "var(--text-xs)", fontWeight: "var(--font-weight-medium)" }}
              >
                Form
              </th>
              <th
                className="px-3 py-3 text-right pr-4 text-foreground"
                style={{ fontSize: "var(--text-xs)", fontWeight: "var(--font-weight-semibold)" }}
              >
                PTS
              </th>
            </tr>
          </thead>
          <tbody>
            {group.teams.map((team) => {
              const gd = team.gf - team.ga;
              const color = rankColor(team.position, total);
              return (
                <tr
                  key={team.id}
                  className="border-t border-border hover:bg-muted/40 transition-colors"
                  style={{ fontSize: "var(--text-sm)" }}
                >
                  <td className="pl-4 pr-2 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-1 h-6 rounded-full"
                        style={{ background: color }}
                      />
                      <span
                        className="text-foreground"
                        style={{
                          fontSize: "var(--text-xs)",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {team.position}
                      </span>
                    </div>
                  </td>
                  <td className="px-2 py-3">
                    <Link
                      to={`/team/${team.code}`}
                      className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity"
                    >
                      <Flag code={team.code} name={team.name} size={20} />
                      <div className="flex flex-col min-w-0">
                        <span
                          className="text-foreground truncate"
                          style={{ fontSize: "var(--text-xs)", fontWeight: "var(--font-weight-medium)" }}
                        >
                          {team.name}
                        </span>
                        <span
                          className="sm:hidden text-muted-foreground truncate tabular-nums"
                          style={{ fontSize: "10px", fontWeight: "var(--font-weight-normal)" }}
                        >
                          {team.won}W · {team.drawn}D · {team.lost}L · GD {gd > 0 ? `+${gd}` : gd}
                        </span>
                      </div>
                    </Link>
                  </td>
                  <Td>{team.played}</Td>
                  <Td hideOnMobile>{team.won}</Td>
                  <Td hideOnMobile>{team.drawn}</Td>
                  <Td hideOnMobile>{team.lost}</Td>
                  <td className="hidden sm:table-cell px-2 py-3">
                    <GDBar gd={gd} max={maxAbsGD} />
                  </td>
                  <td className="hidden sm:table-cell px-2 py-3">
                    <div className="flex justify-center">
                      <FormBadges form={team.form} size={16} />
                    </div>
                  </td>
                  <td
                    className="px-3 py-3 text-right pr-4 text-foreground"
                    style={{ fontWeight: "var(--font-weight-bold)" }}
                  >
                    {team.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function GDBar({ gd, max }: { gd: number; max: number }) {
  const pct = Math.min(100, (Math.abs(gd) / max) * 100);
  const positive = gd > 0;
  const negative = gd < 0;
  const color = positive
    ? "var(--chart-1)"
    : negative
      ? "var(--chart-5)"
      : "var(--chart-4)";
  return (
    <div className="flex items-center gap-2 min-w-[64px]">
      <div className="relative flex items-center w-full">
        <div className="flex-1 flex justify-end">
          {negative && (
            <span
              className="h-1.5 rounded-full"
              style={{ width: `${pct}%`, background: color }}
            />
          )}
        </div>
        <span
          className="mx-1 inline-block"
          style={{ width: 1, height: 10, background: "var(--border)" }}
        />
        <div className="flex-1">
          {positive && (
            <span
              className="block h-1.5 rounded-full"
              style={{ width: `${pct}%`, background: color }}
            />
          )}
        </div>
      </div>
      <span
        className="text-foreground tabular-nums"
        style={{
          fontFamily: "Lexend, sans-serif",
          fontSize: "var(--text-xs)",
          fontWeight: "var(--font-weight-semibold)",
          minWidth: 24,
          textAlign: "right",
        }}
      >
        {gd > 0 ? `+${gd}` : gd}
      </span>
    </div>
  );
}

function Th({ children, hideOnMobile }: { children: React.ReactNode; hideOnMobile?: boolean }) {
  return (
    <th
      className={`${hideOnMobile ? "hidden sm:table-cell " : ""}px-1.5 py-3 text-center`}
      style={{ fontSize: "var(--text-xs)", fontWeight: "var(--font-weight-medium)" }}
    >
      {children}
    </th>
  );
}

function Td({ children, hideOnMobile }: { children: React.ReactNode; hideOnMobile?: boolean }) {
  return (
    <td
      className={`${hideOnMobile ? "hidden sm:table-cell " : ""}px-1.5 py-3 text-center text-muted-foreground`}
    >
      {children}
    </td>
  );
}
