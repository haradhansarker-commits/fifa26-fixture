// Live FIFA World Cup 2026™ data from the public FIFA API (api.fifa.com).
// CORS is open (Access-Control-Allow-Origin: *), so the browser fetches directly.
//
//   Competition 17  = FIFA World Cup™
//   Season      285023 = FIFA World Cup 2026™
//
// The match feed is the single source of truth. Standings are computed from
// finished group matches (FIFA's standing endpoint stays empty until the group
// stage completes). Match detail merges the live + timeline endpoints.

import type {
  Match,
  MatchStatus,
  Team,
  GroupData,
  TeamStats,
  KnockoutRound,
  KnockoutMatch,
  KnockoutSide,
  MatchDetailData,
  Venue,
  LineupPlayer,
  MatchEvent,
  MatchStatLine,
} from "./liveData";

const BASE = "https://api.fifa.com/api/v3";
const COMPETITION = "17";
const SEASON = "285023";

// ---------- localisation helpers ----------

type Localized = { Locale: string; Description: string }[];

function loc(v: Localized | string | null | undefined): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v[0]?.Description ?? "";
}

// ---------- raw API shapes (only the fields we use) ----------

type RawTeam = {
  IdTeam: string | null;
  TeamName: Localized;
  Abbreviation: string | null;
  IdCountry: string | null;
  Tactics?: string | null;
  Score?: number | null;
} | null;

type RawStadium = {
  IdStadium: string;
  Name: Localized;
  CityName: Localized;
  IdCountry: string | null;
  Capacity: number | null;
} | null;

type RawMatch = {
  IdMatch: string;
  IdStage: string;
  IdGroup: string;
  StageName: Localized;
  GroupName: Localized;
  Date: string;
  MatchStatus: number;
  MatchTime: string | null;
  MatchNumber: number;
  Home: RawTeam;
  Away: RawTeam;
  HomeTeamScore: number | null;
  AwayTeamScore: number | null;
  HomeTeamPenaltyScore: number | null;
  AwayTeamPenaltyScore: number | null;
  PlaceHolderA: string | null;
  PlaceHolderB: string | null;
  Winner: string | null;
  Stadium: RawStadium;
};

// ---------- fetch + cache ----------

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`FIFA API ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

let matchesPromise: Promise<RawMatch[]> | null = null;

export function loadMatches(force = false): Promise<RawMatch[]> {
  if (!matchesPromise || force) {
    const url = `${BASE}/calendar/matches?idCompetition=${COMPETITION}&idSeason=${SEASON}&count=500&language=en`;
    matchesPromise = getJson<{ Results: RawMatch[] }>(url)
      .then((d) => d.Results ?? [])
      .catch((e) => {
        matchesPromise = null; // allow retry on next call
        throw e;
      });
  }
  return matchesPromise;
}

// ---------- status / time helpers ----------

// Observed feed codes: 0 = finished (score + winner present), 1 = scheduled.
// 3 = in-progress on FIFA live feeds; handled defensively.
function mapStatus(m: RawMatch): MatchStatus {
  if (m.MatchStatus === 3) return "live";
  if (m.MatchStatus === 0) return "finished";
  return "upcoming";
}

function parseMinute(matchTime: string | null): number | undefined {
  if (!matchTime) return undefined;
  const mm = matchTime.match(/^(\d+)/);
  return mm ? Number(mm[1]) : undefined;
}

function dayLabelFor(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });
}
function dayKeyFor(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA");
}
function timeFor(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
}
function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

// ---------- team mapping ----------

// For decided fixtures the team comes from the feed. For undecided knockout
// slots Home/Away is null and we fall back to the placeholder label (e.g. "2A").
function toTeam(raw: RawTeam, placeholder: string | null): Team {
  if (raw && raw.IdTeam) {
    return {
      id: raw.IdTeam,
      name: loc(raw.TeamName),
      code: raw.Abbreviation ?? raw.IdCountry ?? "",
    };
  }
  return { id: "", name: placeholder ?? "TBD", code: "" };
}

function venueLabel(s: RawStadium): string {
  if (!s) return "";
  const name = loc(s.Name);
  const city = loc(s.CityName);
  return city ? `${name}, ${city}` : name;
}

export function toMatch(m: RawMatch): Match {
  const status = mapStatus(m);
  return {
    id: m.IdMatch,
    startingAtISO: m.Date,
    venueId: m.Stadium?.IdStadium ?? "",
    roundId: m.IdStage,
    group: loc(m.GroupName) || undefined,
    status,
    homeTeam: toTeam(m.Home, m.PlaceHolderA),
    awayTeam: toTeam(m.Away, m.PlaceHolderB),
    homeScore: m.HomeTeamScore ?? undefined,
    awayScore: m.AwayTeamScore ?? undefined,
    minute: status === "live" ? parseMinute(m.MatchTime) : undefined,
    date: dayKeyFor(m.Date),
    dayLabel: dayLabelFor(m.Date),
    time: timeFor(m.Date),
    venue: venueLabel(m.Stadium),
  };
}

function isGroupStage(m: RawMatch): boolean {
  return loc(m.StageName) === "First Stage";
}

// ---------- fixtures ----------

export async function fetchFixtures(): Promise<Match[]> {
  const raw = await loadMatches();
  return raw
    .map(toMatch)
    .sort((a, b) => a.startingAtISO.localeCompare(b.startingAtISO));
}

// ---------- standings (computed from group matches) ----------

export async function fetchStandings(): Promise<GroupData[]> {
  const raw = await loadMatches();
  const groupMatches = raw.filter(isGroupStage);

  const byGroup = new Map<string, RawMatch[]>();
  for (const m of groupMatches) {
    const g = loc(m.GroupName);
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g)!.push(m);
  }

  const groups: GroupData[] = [];

  type Row = TeamStats & { _form: { iso: string; r: "W" | "D" | "L" }[] };

  for (const groupName of [...byGroup.keys()].sort()) {
    const ms = byGroup.get(groupName)!;
    const table = new Map<string, Row>();

    const ensure = (raw: RawTeam): Row => {
      const t = toTeam(raw, null);
      if (!table.has(t.id)) {
        table.set(t.id, {
          id: t.id, position: 0, name: t.name, code: t.code,
          played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0,
          form: [], _form: [],
        });
      }
      return table.get(t.id)!;
    };

    for (const m of ms) {
      if (!m.Home?.IdTeam || !m.Away?.IdTeam) continue;
      const home = ensure(m.Home);
      const away = ensure(m.Away);
      if (mapStatus(m) !== "finished") continue;

      const hs = m.HomeTeamScore ?? 0;
      const as = m.AwayTeamScore ?? 0;
      home.played++; away.played++;
      home.gf += hs; home.ga += as;
      away.gf += as; away.ga += hs;

      if (hs > as) {
        home.won++; home.points += 3; away.lost++;
        home._form.push({ iso: m.Date, r: "W" }); away._form.push({ iso: m.Date, r: "L" });
      } else if (hs < as) {
        away.won++; away.points += 3; home.lost++;
        home._form.push({ iso: m.Date, r: "L" }); away._form.push({ iso: m.Date, r: "W" });
      } else {
        home.drawn++; away.drawn++; home.points++; away.points++;
        home._form.push({ iso: m.Date, r: "D" }); away._form.push({ iso: m.Date, r: "D" });
      }
    }

    const teams = [...table.values()]
      .sort((a, b) =>
        b.points - a.points ||
        (b.gf - b.ga) - (a.gf - a.ga) ||
        b.gf - a.gf ||
        a.name.localeCompare(b.name),
      )
      .map((t, i) => {
        const { _form, ...rest } = t;
        rest.position = i + 1;
        rest.form = _form.sort((x, y) => x.iso.localeCompare(y.iso)).map((f) => f.r).slice(-5);
        return rest;
      });

    groups.push({ name: groupName, teams });
  }

  return groups;
}

// ---------- knockout bracket ----------

const KO_STAGE_ORDER = [
  "Round of 32",
  "Round of 16",
  "Quarter-final",
  "Semi-final",
  "Play-off for third place",
  "Final",
];

const KO_TITLE: Record<string, string> = {
  "Round of 32": "Round of 32",
  "Round of 16": "Round of 16",
  "Quarter-final": "Quarter-finals",
  "Semi-final": "Semi-finals",
  "Play-off for third place": "Third-place Play-off",
  "Final": "Final",
};

function toKnockoutSide(raw: RawTeam, placeholder: string | null, winnerId: string | null, finished: boolean): KnockoutSide {
  if (raw && raw.IdTeam) {
    return {
      id: raw.IdTeam,
      name: loc(raw.TeamName),
      code: raw.Abbreviation ?? raw.IdCountry ?? "",
      score: finished ? raw.Score ?? undefined : undefined,
      winner: winnerId != null && winnerId === raw.IdTeam,
    };
  }
  return { name: placeholder ?? "TBD", code: "", placeholder: true };
}

export async function fetchKnockout(): Promise<KnockoutRound[]> {
  const raw = await loadMatches();
  const koMatches = raw.filter((m) => !isGroupStage(m));

  const byStage = new Map<string, RawMatch[]>();
  for (const m of koMatches) {
    const s = loc(m.StageName);
    if (!byStage.has(s)) byStage.set(s, []);
    byStage.get(s)!.push(m);
  }

  const rounds: KnockoutRound[] = [];
  for (const stage of KO_STAGE_ORDER) {
    const ms = byStage.get(stage);
    if (!ms) continue;
    ms.sort((a, b) => a.MatchNumber - b.MatchNumber);

    const matches: KnockoutMatch[] = ms.map((m) => {
      const status = mapStatus(m);
      const finished = status === "finished";
      const decided = !!(m.Home?.IdTeam && m.Away?.IdTeam);
      return {
        id: m.IdMatch,
        matchId: decided ? m.IdMatch : undefined,
        date: shortDate(m.Date),
        home: toKnockoutSide(m.Home, m.PlaceHolderA, m.Winner, finished),
        away: toKnockoutSide(m.Away, m.PlaceHolderB, m.Winner, finished),
        status,
        minute: status === "live" ? parseMinute(m.MatchTime) : undefined,
      };
    });

    rounds.push({ id: stage, title: KO_TITLE[stage] ?? stage, matches });
  }

  return rounds;
}

// ---------- match detail (live + timeline) ----------

type RawPlayer = {
  IdPlayer: string;
  ShirtNumber: number;
  Status: number; // 1 = starter, 2 = bench
  Position: number; // 0 GK, 1 DF, 2 MF, 3 FW
  PlayerName: Localized;
};

type RawLiveTeam = {
  IdTeam: string;
  TeamName: Localized;
  Abbreviation: string | null;
  Tactics: string | null;
  Players: RawPlayer[];
} | null;

type RawLive = {
  IdMatch: string;
  IdStage: string;
  HomeTeam: RawLiveTeam;
  AwayTeam: RawLiveTeam;
  BallPossession: { Intervals?: unknown; OverallHome?: number; OverallAway?: number } | null;
  Stadium: RawStadium;
};

type RawEvent = {
  EventId: string;
  IdTeam: string | null;
  MatchMinute: string;
  Type: number;
  TypeLocalized: Localized;
  EventDescription: Localized;
};

const POSITION: Record<number, LineupPlayer["position"]> = { 0: "GK", 1: "DF", 2: "MF", 3: "FW" };

function toLineup(team: RawLiveTeam): LineupPlayer[] {
  if (!team) return [];
  return team.Players
    .filter((p) => p.Status === 1)
    .sort((a, b) => a.Position - b.Position || a.ShirtNumber - b.ShirtNumber)
    .map((p) => ({
      playerId: p.IdPlayer,
      jersey: p.ShirtNumber,
      name: loc(p.PlayerName),
      position: POSITION[p.Position] ?? "MF",
      isStarter: true,
    }));
}

function nameBeforeParen(text: string): string {
  const i = text.indexOf("(");
  return (i > 0 ? text.slice(0, i) : text).trim();
}

const EVENT_TYPE: Record<number, MatchEvent["type"]> = { 0: "goal", 2: "yellow", 3: "red", 5: "sub" };

function toEvents(events: RawEvent[], homeId: string): MatchEvent[] {
  return events
    .filter((e) => e.Type in EVENT_TYPE)
    .map((e) => ({
      id: e.EventId,
      minute: parseMinute(e.MatchMinute) ?? 0,
      type: EVENT_TYPE[e.Type],
      teamSide: (e.IdTeam === homeId ? "home" : "away") as "home" | "away",
      playerName: nameBeforeParen(loc(e.EventDescription)) || loc(e.TypeLocalized),
      detail: e.Type === 5 ? loc(e.EventDescription) : loc(e.TypeLocalized),
    }));
}

// Derive a stats panel from the timeline (FIFA's match-stats endpoint is gated).
function toStats(events: RawEvent[], homeId: string, live: RawLive): MatchStatLine[] {
  const count = (type: number) => {
    let h = 0, a = 0;
    for (const e of events) {
      if (e.Type !== type) continue;
      if (e.IdTeam === homeId) h++; else a++;
    }
    return [h, a] as const;
  };

  const [shotsH, shotsA] = count(12);
  const [cornersH, cornersA] = count(16);
  const [foulsH, foulsA] = count(18);
  const [offH, offA] = count(15);
  const [ycH, ycA] = count(2);

  const stats: MatchStatLine[] = [];
  const poss = live.BallPossession;
  if (poss && poss.OverallHome != null && poss.OverallAway != null) {
    stats.push({ label: "Possession", home: Math.round(poss.OverallHome), away: Math.round(poss.OverallAway), unit: "%" });
  }
  stats.push(
    { label: "Shots", home: shotsH, away: shotsA },
    { label: "Corners", home: cornersH, away: cornersA },
    { label: "Fouls", home: foulsH, away: foulsA },
    { label: "Offsides", home: offH, away: offA },
    { label: "Yellow cards", home: ycH, away: ycA },
  );
  return stats;
}

function toVenue(s: RawStadium): Venue {
  return {
    id: s?.IdStadium ?? "",
    name: s ? loc(s.Name) : "",
    city: s ? loc(s.CityName) : "",
    country: "USA",
    capacity: s?.Capacity ?? 0,
    surface: "Grass",
    imagePath: "",
    latitude: 0,
    longitude: 0,
  };
}

export async function fetchMatchDetail(matchId: string): Promise<MatchDetailData | undefined> {
  const all = await loadMatches();
  const rawMatch = all.find((m) => m.IdMatch === matchId);
  if (!rawMatch) return undefined;

  const match = toMatch(rawMatch);
  const venue = toVenue(rawMatch.Stadium);

  // For upcoming matches there is no live/timeline payload yet.
  if (match.status === "upcoming") {
    return {
      match, venue,
      homeFormation: rawMatch.Home?.Tactics ?? "",
      awayFormation: rawMatch.Away?.Tactics ?? "",
      homeLineup: [], awayLineup: [], events: [], stats: [], h2h: [],
    };
  }

  const stage = rawMatch.IdStage;
  const [live, timeline] = await Promise.all([
    getJson<RawLive>(`${BASE}/live/football/${COMPETITION}/${SEASON}/${stage}/${matchId}?language=en`).catch(() => null),
    getJson<{ Event: RawEvent[] }>(`${BASE}/timelines/${COMPETITION}/${SEASON}/${stage}/${matchId}?language=en`).catch(() => null),
  ]);

  const homeId = rawMatch.Home?.IdTeam ?? "";
  const events = timeline?.Event ? toEvents(timeline.Event, homeId) : [];

  return {
    match,
    venue,
    homeFormation: live?.HomeTeam?.Tactics ?? rawMatch.Home?.Tactics ?? "",
    awayFormation: live?.AwayTeam?.Tactics ?? rawMatch.Away?.Tactics ?? "",
    homeLineup: toLineup(live?.HomeTeam ?? null),
    awayLineup: toLineup(live?.AwayTeam ?? null),
    events: events.sort((a, b) => a.minute - b.minute),
    stats: live && timeline?.Event ? toStats(timeline.Event, homeId, live) : [],
    h2h: [],
  };
}
