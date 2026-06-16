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

const FIFA_BASE = "https://api.fifa.com/api/v3";
const COMPETITION = "17";
const SEASON = "285023";

// In production, route through our own cached serverless proxy (/api/fifa) so
// the FIFA origin is hit at most every ~10 min (30 s while a match is live) and
// users are served from Vercel's edge cache. In dev there are no serverless
// functions under Vite, so call FIFA directly (its CORS is open).
function api(endpoint: string): string {
  const full = `${FIFA_BASE}${endpoint}`;
  return import.meta.env.PROD ? `/api/fifa?u=${encodeURIComponent(full)}` : full;
}

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

// fetch() has no default timeout, so a slow/stuck request would hang forever and
// block Promise.all (endless loading). Abort after `timeoutMs` instead.
const FETCH_TIMEOUT_MS = 8000;

async function getJson<T>(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`FIFA API ${res.status}: ${url}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

let matchesPromise: Promise<RawMatch[]> | null = null;

export function loadMatches(force = false): Promise<RawMatch[]> {
  if (!matchesPromise || force) {
    const url = api(`/calendar/matches?idCompetition=${COMPETITION}&idSeason=${SEASON}&count=500&language=en`);
    matchesPromise = getJson<{ Results: RawMatch[] }>(url)
      .then((d) => d.Results ?? [])
      .catch((e) => {
        matchesPromise = null; // allow retry on next call
        throw e;
      });
  }
  return matchesPromise;
}

// Timelines for every finished match, fetched once and shared by both the
// leaderboards and the standings fair-play tiebreaker (previously each fetched
// the same timelines separately — ~2× the requests).
export type FinishedTimeline = { match: RawMatch; events: RawEvent[] | null };

let finishedTimelinesPromise: Promise<FinishedTimeline[]> | null = null;

function loadFinishedTimelines(): Promise<FinishedTimeline[]> {
  if (!finishedTimelinesPromise) {
    finishedTimelinesPromise = (async () => {
      const all = await loadMatches();
      const finished = all.filter((m) => mapStatus(m) === "finished");
      const events = await Promise.all(
        finished.map((m) =>
          getJson<{ Event: RawEvent[] }>(api(`/timelines/${COMPETITION}/${SEASON}/${m.IdStage}/${m.IdMatch}?language=en`))
            .then((d) => d.Event ?? null)
            .catch(() => null),
        ),
      );
      return finished.map((m, i) => ({ match: m, events: events[i] }));
    })().catch((e) => {
      finishedTimelinesPromise = null;
      throw e;
    });
  }
  return finishedTimelinesPromise;
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

// ---------- fair-play points (FIFA disciplinary tiebreaker) ----------
// Per player per match: single yellow -1, two yellows (red) -3,
// direct red -4, yellow + direct red -5. Summed per team. Needs card events
// from finished group-match timelines, so it is fetched + cached separately.

let disciplinaryPromise: Promise<Map<string, number>> | null = null;

function fetchDisciplinary(): Promise<Map<string, number>> {
  if (!disciplinaryPromise) {
    disciplinaryPromise = buildDisciplinary().catch((e) => {
      disciplinaryPromise = null;
      throw e;
    });
  }
  return disciplinaryPromise;
}

async function buildDisciplinary(): Promise<Map<string, number>> {
  const timelines = (await loadFinishedTimelines()).filter((t) => isGroupStage(t.match));

  const teamPoints = new Map<string, number>();

  timelines.forEach(({ match, events }) => {
    if (!events) return;
    const matchId = match.IdMatch;
    // group card counts per player within this match
    const perPlayer = new Map<string, { teamId: string; y: number; r: number }>();
    for (const e of events) {
      if (e.Type !== 2 && e.Type !== 3) continue; // yellow / red only
      const id = e.IdPlayer;
      if (!id) continue;
      const key = `${matchId}:${id}`;
      if (!perPlayer.has(key)) perPlayer.set(key, { teamId: e.IdTeam ?? "", y: 0, r: 0 });
      const p = perPlayer.get(key)!;
      if (e.Type === 2) p.y++; else p.r++;
    }
    for (const p of perPlayer.values()) {
      let deduction = 0;
      if (p.r > 0) deduction = p.y >= 2 ? -3 : p.y === 1 ? -5 : -4; // 2nd yellow / yellow+red / direct red
      else if (p.y === 1) deduction = -1;
      else if (p.y >= 2) deduction = -3; // safety: two yellows recorded without explicit red
      teamPoints.set(p.teamId, (teamPoints.get(p.teamId) ?? 0) + deduction);
    }
  });

  return teamPoints;
}

// ---------- standings (computed from group matches) ----------

export async function fetchStandings(): Promise<GroupData[]> {
  const raw = await loadMatches();
  const groupMatches = raw.filter(isGroupStage);
  const fairPlay = await fetchDisciplinary().catch(() => new Map<string, number>());

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

    const ordered = orderGroup([...table.values()], ms, fairPlay);

    const teams = ordered.map((t, i) => {
      const { _form, ...rest } = t;
      rest.position = i + 1;
      rest.form = _form.sort((x, y) => x.iso.localeCompare(y.iso)).map((f) => f.r).slice(-5);
      return rest;
    });

    groups.push({ name: groupName, teams });
  }

  return groups;
}

// FIFA group ranking: 1) points, 2) goal difference, 3) goals for (all matches).
// Teams still level then split by 4) head-to-head points, 5) H2H goal diff,
// 6) H2H goals, 7) fair-play points, 8) alphabetical (stands in for drawing lots).
type OrderRow = TeamStats & { _form: { iso: string; r: "W" | "D" | "L" }[] };

function orderGroup(rows: OrderRow[], matches: RawMatch[], fairPlay: Map<string, number>): OrderRow[] {
  const gd = (t: OrderRow) => t.gf - t.ga;

  const primary = [...rows].sort((a, b) => b.points - a.points || gd(b) - gd(a) || b.gf - a.gf);

  // Re-order runs of teams identical on points / GD / GF using the mini-table.
  const result: OrderRow[] = [];
  let i = 0;
  while (i < primary.length) {
    let j = i + 1;
    while (
      j < primary.length &&
      primary[j].points === primary[i].points &&
      gd(primary[j]) === gd(primary[i]) &&
      primary[j].gf === primary[i].gf
    ) {
      j++;
    }
    const tied = primary.slice(i, j);
    if (tied.length > 1) result.push(...breakTie(tied, matches, fairPlay));
    else result.push(tied[0]);
    i = j;
  }
  return result;
}

function breakTie(tied: OrderRow[], matches: RawMatch[], fairPlay: Map<string, number>): OrderRow[] {
  const ids = new Set(tied.map((t) => t.id));
  const h2h = new Map<string, { pts: number; gf: number; ga: number }>();
  const ensure = (id: string) => {
    if (!h2h.has(id)) h2h.set(id, { pts: 0, gf: 0, ga: 0 });
    return h2h.get(id)!;
  };

  for (const m of matches) {
    const hId = m.Home?.IdTeam, aId = m.Away?.IdTeam;
    if (!hId || !aId || !ids.has(hId) || !ids.has(aId)) continue;
    if (mapStatus(m) !== "finished") continue;
    const hs = m.HomeTeamScore ?? 0, as = m.AwayTeamScore ?? 0;
    const h = ensure(hId), a = ensure(aId);
    h.gf += hs; h.ga += as; a.gf += as; a.ga += hs;
    if (hs > as) h.pts += 3; else if (hs < as) a.pts += 3; else { h.pts++; a.pts++; }
  }

  const hgd = (id: string) => { const r = h2h.get(id); return r ? r.gf - r.ga : 0; };
  const hpts = (id: string) => h2h.get(id)?.pts ?? 0;
  const hgf = (id: string) => h2h.get(id)?.gf ?? 0;
  const fp = (id: string) => fairPlay.get(id) ?? 0; // less negative = fewer cards = better

  return [...tied].sort((a, b) =>
    hpts(b.id) - hpts(a.id) ||
    hgd(b.id) - hgd(a.id) ||
    hgf(b.id) - hgf(a.id) ||
    fp(b.id) - fp(a.id) ||
    a.name.localeCompare(b.name),
  );
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
  IdPlayer?: string | null;
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

  // FIFA's public feed only exposes shots, corners, fouls and offsides via the
  // timeline. Ball possession, expected goals, shots on target and throw-ins
  // are not published for this season, so they are omitted rather than faked.
  const stats: MatchStatLine[] = [];
  const poss = live.BallPossession;
  if (poss && poss.OverallHome != null && poss.OverallAway != null) {
    stats.push({ label: "Ball possession", home: Math.round(poss.OverallHome), away: Math.round(poss.OverallAway), unit: "%" });
  }
  stats.push(
    { label: "Total shots", home: shotsH, away: shotsA },
    { label: "Corners", home: cornersH, away: cornersA },
    { label: "Fouls committed", home: foulsH, away: foulsA },
    { label: "Offsides", home: offH, away: offA },
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
    getJson<RawLive>(api(`/live/football/${COMPETITION}/${SEASON}/${stage}/${matchId}?language=en`)).catch(() => null),
    getJson<{ Event: RawEvent[] }>(api(`/timelines/${COMPETITION}/${SEASON}/${stage}/${matchId}?language=en`)).catch(() => null),
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

// ---------- leaderboards (aggregated from finished-match timelines) ----------
// FIFA's per-player stat endpoints are empty for this season, so tournament
// leaders are tallied from goal/assist/card/shot events across played matches.

export type LbCategory = "goals" | "assists" | "shots" | "yellow" | "red";

export type LbEntry = {
  rank: number;
  playerId: string;
  name: string;
  teamCode: string;
  teamName: string;
  nationalityCode: string;
  value: number;
};

export const LB_CATEGORIES: LbCategory[] = ["goals", "assists", "shots", "yellow", "red"];

const EVENT_CATEGORY: Record<number, LbCategory> = { 0: "goals", 1: "assists", 12: "shots", 2: "yellow", 3: "red" };

function eventPlayerName(type: number, desc: string): string {
  if (type === 1) {
    // "Assisted by Erik LIRA."
    return desc.replace(/^Assisted by\s*/i, "").replace(/\.\s*$/, "").trim();
  }
  return nameBeforeParen(desc);
}

function emptyLeaderboards(): Record<LbCategory, LbEntry[]> {
  return { goals: [], assists: [], shots: [], yellow: [], red: [] };
}

let leaderboardsPromise: Promise<Record<LbCategory, LbEntry[]>> | null = null;

export function fetchLeaderboards(force = false): Promise<Record<LbCategory, LbEntry[]>> {
  if (!leaderboardsPromise || force) {
    leaderboardsPromise = buildLeaderboards().catch((e) => {
      leaderboardsPromise = null;
      throw e;
    });
  }
  return leaderboardsPromise;
}

async function buildLeaderboards(): Promise<Record<LbCategory, LbEntry[]>> {
  const all = await loadMatches();

  const teamMap = new Map<string, { code: string; name: string }>();
  for (const m of all) {
    for (const tm of [m.Home, m.Away]) {
      if (tm?.IdTeam) teamMap.set(tm.IdTeam, { code: tm.Abbreviation ?? tm.IdCountry ?? "", name: loc(tm.TeamName) });
    }
  }

  const timelines = await loadFinishedTimelines();

  type Agg = { name: string; teamId: string; goals: number; assists: number; shots: number; yellow: number; red: number };
  const players = new Map<string, Agg>();

  for (const { events } of timelines) {
    if (!events) continue;
    for (const e of events) {
      const cat = EVENT_CATEGORY[e.Type];
      if (!cat) continue;
      const id = e.IdPlayer;
      if (!id) continue;
      if (!players.has(id)) players.set(id, { name: "", teamId: e.IdTeam ?? "", goals: 0, assists: 0, shots: 0, yellow: 0, red: 0 });
      const agg = players.get(id)!;
      agg[cat]++;
      const nm = eventPlayerName(e.Type, loc(e.EventDescription));
      if (nm) agg.name = nm;
      if (e.IdTeam) agg.teamId = e.IdTeam;
    }
  }

  const out = emptyLeaderboards();
  for (const cat of LB_CATEGORIES) {
    out[cat] = [...players.entries()]
      .filter(([, a]) => a[cat] > 0)
      .sort((x, y) => y[1][cat] - x[1][cat] || x[1].name.localeCompare(y[1].name))
      .slice(0, 20)
      .map(([id, a], i) => {
        const team = teamMap.get(a.teamId) ?? { code: "", name: "" };
        return {
          rank: i + 1,
          playerId: id,
          name: a.name || "Unknown",
          teamCode: team.code,
          teamName: team.name,
          nationalityCode: team.code,
          value: a[cat],
        };
      });
  }
  return out;
}

// ---------- team profile (real data: standing + fixtures) ----------

export type TeamProfileData = {
  team: Team;
  group?: string;
  standing?: TeamStats;
  matches: Match[];
};

export async function fetchTeamProfile(code: string): Promise<TeamProfileData | undefined> {
  const wanted = code.toUpperCase();
  const [fixtures, groups] = await Promise.all([fetchFixtures(), fetchStandings()]);

  const matches = fixtures.filter(
    (m) => m.homeTeam.code.toUpperCase() === wanted || m.awayTeam.code.toUpperCase() === wanted,
  );
  if (matches.length === 0) return undefined;

  const sample = matches[0];
  const team =
    sample.homeTeam.code.toUpperCase() === wanted ? sample.homeTeam : sample.awayTeam;

  let group: string | undefined;
  let standing: TeamStats | undefined;
  for (const g of groups) {
    const row = g.teams.find((t) => t.code.toUpperCase() === wanted);
    if (row) {
      group = g.name;
      standing = row;
      break;
    }
  }

  return { team, group, standing, matches };
}
