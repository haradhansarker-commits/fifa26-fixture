// Mock data shaped loosely after Sportmonks Football API entities.
// Replace these getters with real API calls when wiring Sportmonks.

export type Team = { id: string; name: string; code: string };

export type MatchStatus = "upcoming" | "live" | "finished";

export type Round = {
  id: string;
  name: string;
  stage: "group" | "knockout";
};

export type Match = {
  id: string;
  startingAtISO: string;
  venueId: string;
  roundId: string;
  group?: string;
  status: MatchStatus;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  minute?: number;
  date: string;
  dayLabel: string;
  time: string;
  venue: string;
};

export type TeamStats = {
  id: string;
  position: number;
  name: string;
  code: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
  form: ("W" | "D" | "L")[];
};

export type GroupData = { name: string; teams: TeamStats[] };

export type KnockoutSide = {
  id?: string;
  name: string;
  code: string;
  score?: number;
  winner?: boolean;
  // When true, `name` holds a slot label (e.g. "1A", "2B", "3rd C/E/F/H/J")
  // and no flag is rendered — the qualifier is not decided yet.
  placeholder?: boolean;
} | null;

export type KnockoutMatch = {
  id: string;
  matchId?: string;
  date: string;
  home: KnockoutSide;
  away: KnockoutSide;
  status?: MatchStatus;
  minute?: number;
};

export type KnockoutRound = {
  id: string;
  title: string;
  matches: KnockoutMatch[];
};

export type Venue = {
  id: string;
  name: string;
  city: string;
  country: "USA" | "Canada" | "Mexico";
  capacity: number;
  surface: "Grass" | "Hybrid";
  imagePath: string;
  latitude: number;
  longitude: number;
};

export type Player = {
  id: string;
  commonName: string;
  fullName: string;
  teamId: string;
  nationalityCode: string;
  position: "GK" | "DF" | "MF" | "FW";
  jersey: number;
  age: number;
  heightCm: number;
  imagePath?: string;
  stats: {
    appearances: number;
    minutes: number;
    goals: number;
    assists: number;
    yellow: number;
    red: number;
    shotsOnTarget: number;
  };
};

export type LineupPlayer = {
  playerId: string;
  jersey: number;
  name: string;
  position: "GK" | "DF" | "MF" | "FW";
  isStarter: boolean;
};

export type MatchEvent = {
  id: string;
  minute: number;
  type: "goal" | "yellow" | "red" | "sub";
  teamSide: "home" | "away";
  playerName: string;
  detail?: string;
};

export type MatchStatLine = {
  label: string;
  home: number;
  away: number;
  unit?: string;
};

export type MatchDetailData = {
  match: Match;
  venue: Venue;
  homeFormation: string;
  awayFormation: string;
  homeLineup: LineupPlayer[];
  awayLineup: LineupPlayer[];
  events: MatchEvent[];
  stats: MatchStatLine[];
  h2h: { date: string; home: Team; away: Team; homeScore: number; awayScore: number }[];
};

export type TopScorer = {
  rank: number;
  playerId: string;
  name: string;
  teamCode: string;
  teamName: string;
  nationalityCode: string;
  goals: number;
  assists: number;
  minutes: number;
};

export type LeaderboardCategory =
  | "goals"
  | "assists"
  | "yellow"
  | "red"
  | "shotsOnTarget";

export type LeaderboardEntry = {
  rank: number;
  playerId: string;
  name: string;
  teamCode: string;
  teamName: string;
  nationalityCode: string;
  value: number;
  minutes: number;
};

// ---------- Rounds ----------

export const rounds: Round[] = [
  { id: "group-md1", name: "Group · Matchday 1", stage: "group" },
  { id: "group-md2", name: "Group · Matchday 2", stage: "group" },
  { id: "group-md3", name: "Group · Matchday 3", stage: "group" },
  { id: "r32", name: "Round of 32", stage: "knockout" },
  { id: "r16", name: "Round of 16", stage: "knockout" },
  { id: "qf", name: "Quarter-finals", stage: "knockout" },
  { id: "sf", name: "Semi-finals", stage: "knockout" },
  { id: "3rd", name: "Third-place Play-off", stage: "knockout" },
  { id: "final", name: "Final", stage: "knockout" },
];

// ---------- Venues ----------

export const venues: Venue[] = [
  { id: "azteca", name: "Estadio Azteca", city: "Mexico City", country: "Mexico", capacity: 87000, surface: "Hybrid", imagePath: "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=1200", latitude: 19.3029, longitude: -99.1505 },
  { id: "sofi", name: "SoFi Stadium", city: "Los Angeles", country: "USA", capacity: 70240, surface: "Hybrid", imagePath: "https://images.unsplash.com/photo-1602674809970-a0c79b73d3ce?w=1200", latitude: 33.9535, longitude: -118.3392 },
  { id: "bmo", name: "BMO Field", city: "Toronto", country: "Canada", capacity: 45500, surface: "Grass", imagePath: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=1200", latitude: 43.6332, longitude: -79.4185 },
  { id: "metlife", name: "MetLife Stadium", city: "East Rutherford, NJ", country: "USA", capacity: 82500, surface: "Hybrid", imagePath: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200", latitude: 40.8135, longitude: -74.0745 },
  { id: "mercedes", name: "Mercedes-Benz Stadium", city: "Atlanta", country: "USA", capacity: 71000, surface: "Hybrid", imagePath: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200", latitude: 33.7553, longitude: -84.4006 },
  { id: "att", name: "AT&T Stadium", city: "Dallas", country: "USA", capacity: 80000, surface: "Hybrid", imagePath: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=1200", latitude: 32.7473, longitude: -97.0945 },
  { id: "lumen", name: "Lumen Field", city: "Seattle", country: "USA", capacity: 69000, surface: "Grass", imagePath: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200", latitude: 47.5952, longitude: -122.3316 },
  { id: "arrowhead", name: "Arrowhead Stadium", city: "Kansas City", country: "USA", capacity: 76416, surface: "Hybrid", imagePath: "https://images.unsplash.com/photo-1592415486689-125cbbfcbee2?w=1200", latitude: 39.0489, longitude: -94.4839 },
];

// ---------- Teams ----------

const teamList: Team[] = [
  { id: "mex", name: "Mexico", code: "MEX" },
  { id: "kor", name: "South Korea", code: "KOR" },
  { id: "usa", name: "United States", code: "USA" },
  { id: "fra", name: "France", code: "FRA" },
  { id: "can", name: "Canada", code: "CAN" },
  { id: "ger", name: "Germany", code: "GER" },
  { id: "bra", name: "Brazil", code: "BRA" },
  { id: "eng", name: "England", code: "ENG" },
  { id: "ita", name: "Italy", code: "ITA" },
  { id: "nga", name: "Nigeria", code: "NGA" },
  { id: "jpn", name: "Japan", code: "JPN" },
  { id: "aus", name: "Australia", code: "AUS" },
  { id: "arg", name: "Argentina", code: "ARG" },
  { id: "esp", name: "Spain", code: "ESP" },
  { id: "por", name: "Portugal", code: "POR" },
  { id: "bel", name: "Belgium", code: "BEL" },
  { id: "col", name: "Colombia", code: "COL" },
  { id: "mar", name: "Morocco", code: "MAR" },
  { id: "uru", name: "Uruguay", code: "URU" },
  { id: "sen", name: "Senegal", code: "SEN" },
];

export function getTeamByCode(code: string): Team | undefined {
  return teamList.find((tm) => tm.code.toLowerCase() === code.toLowerCase());
}

export function getAllTeams(): Team[] {
  return teamList;
}

// ---------- Matches ----------

const t = (code: string): Team => getTeamByCode(code)!;

const rawMatches: Array<Omit<Match, "date" | "dayLabel" | "time" | "venue">> = [
  { id: "1",  startingAtISO: "2026-06-12T20:00:00Z", venueId: "azteca",    roundId: "group-md1", group: "Group A", status: "finished", homeTeam: t("MEX"), awayTeam: t("KOR"), homeScore: 2, awayScore: 1 },
  { id: "2",  startingAtISO: "2026-06-13T00:00:00Z", venueId: "sofi",      roundId: "group-md1", group: "Group B", status: "finished", homeTeam: t("USA"), awayTeam: t("FRA"), homeScore: 1, awayScore: 3 },
  { id: "3",  startingAtISO: "2026-06-13T17:00:00Z", venueId: "bmo",       roundId: "group-md1", group: "Group C", status: "finished", homeTeam: t("CAN"), awayTeam: t("GER"), homeScore: 0, awayScore: 2 },
  { id: "4",  startingAtISO: "2026-06-13T21:00:00Z", venueId: "metlife",   roundId: "group-md1", group: "Group D", status: "live",     homeTeam: t("BRA"), awayTeam: t("ENG"), homeScore: 1, awayScore: 0, minute: 67 },
  { id: "5",  startingAtISO: "2026-06-14T23:00:00Z", venueId: "mercedes",  roundId: "group-md1", group: "Group A", status: "upcoming", homeTeam: t("ITA"), awayTeam: t("NGA") },
  { id: "6",  startingAtISO: "2026-06-15T01:30:00Z", venueId: "att",       roundId: "group-md1", group: "Group B", status: "upcoming", homeTeam: t("JPN"), awayTeam: t("AUS") },
  { id: "7",  startingAtISO: "2026-06-15T19:00:00Z", venueId: "lumen",     roundId: "group-md2", group: "Group E", status: "upcoming", homeTeam: t("ARG"), awayTeam: t("ESP") },
  { id: "8",  startingAtISO: "2026-06-15T22:00:00Z", venueId: "arrowhead", roundId: "group-md2", group: "Group F", status: "upcoming", homeTeam: t("POR"), awayTeam: t("BEL") },
  { id: "9",  startingAtISO: "2026-06-17T20:00:00Z", venueId: "metlife",   roundId: "group-md2", group: "Group D", status: "upcoming", homeTeam: t("ENG"), awayTeam: t("URU") },
  { id: "10", startingAtISO: "2026-06-18T20:00:00Z", venueId: "sofi",      roundId: "group-md2", group: "Group B", status: "upcoming", homeTeam: t("FRA"), awayTeam: t("JPN") },
  { id: "11", startingAtISO: "2026-06-21T20:00:00Z", venueId: "azteca",    roundId: "group-md3", group: "Group A", status: "upcoming", homeTeam: t("MEX"), awayTeam: t("ITA") },
  { id: "12", startingAtISO: "2026-06-22T22:00:00Z", venueId: "att",       roundId: "group-md3", group: "Group C", status: "upcoming", homeTeam: t("GER"), awayTeam: t("MAR") },
];

function dayLabelFor(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });
}

function dayKeyFor(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA");
}

function timeFor(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
}

const matches: Match[] = rawMatches.map((m) => {
  const venue = venues.find((v) => v.id === m.venueId)!;
  return {
    ...m,
    date: dayKeyFor(m.startingAtISO),
    dayLabel: dayLabelFor(m.startingAtISO),
    time: timeFor(m.startingAtISO),
    venue: `${venue.name}, ${venue.city}`,
  };
});

export function getLiveMatches(): Match[] {
  return matches;
}

export function getMatchById(id: string): Match | undefined {
  return matches.find((m) => m.id === id);
}

export function getRounds(): Round[] {
  return rounds;
}

export function getVenues(): Venue[] {
  return venues;
}

export function getVenueById(id: string): Venue | undefined {
  return venues.find((v) => v.id === id);
}

// ---------- Group standings ----------

const liveGroups: GroupData[] = [
  {
    name: "Group A",
    teams: [
      { id: "mex", position: 1, name: "Mexico", code: "MEX", played: 3, won: 2, drawn: 1, lost: 0, gf: 5, ga: 2, points: 7, form: ["W", "W", "D"] },
      { id: "ita", position: 2, name: "Italy", code: "ITA", played: 3, won: 2, drawn: 0, lost: 1, gf: 4, ga: 2, points: 6, form: ["W", "L", "W"] },
      { id: "kor", position: 3, name: "South Korea", code: "KOR", played: 3, won: 1, drawn: 1, lost: 1, gf: 3, ga: 3, points: 4, form: ["L", "D", "W"] },
      { id: "nga", position: 4, name: "Nigeria", code: "NGA", played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 6, points: 0, form: ["L", "L", "L"] },
    ],
  },
  {
    name: "Group B",
    teams: [
      { id: "fra", position: 1, name: "France", code: "FRA", played: 3, won: 3, drawn: 0, lost: 0, gf: 7, ga: 1, points: 9, form: ["W", "W", "W"] },
      { id: "usa", position: 2, name: "United States", code: "USA", played: 3, won: 1, drawn: 1, lost: 1, gf: 4, ga: 4, points: 4, form: ["L", "W", "D"] },
      { id: "jpn", position: 3, name: "Japan", code: "JPN", played: 3, won: 1, drawn: 0, lost: 2, gf: 2, ga: 3, points: 3, form: ["W", "L", "L"] },
      { id: "aus", position: 4, name: "Australia", code: "AUS", played: 3, won: 0, drawn: 1, lost: 2, gf: 1, ga: 6, points: 1, form: ["D", "L", "L"] },
    ],
  },
  {
    name: "Group C",
    teams: [
      { id: "ger", position: 1, name: "Germany", code: "GER", played: 3, won: 2, drawn: 1, lost: 0, gf: 6, ga: 2, points: 7, form: ["W", "D", "W"] },
      { id: "can", position: 2, name: "Canada", code: "CAN", played: 3, won: 2, drawn: 0, lost: 1, gf: 5, ga: 3, points: 6, form: ["W", "W", "L"] },
      { id: "mar", position: 3, name: "Morocco", code: "MAR", played: 3, won: 1, drawn: 0, lost: 2, gf: 2, ga: 4, points: 3, form: ["L", "W", "L"] },
      { id: "col", position: 4, name: "Colombia", code: "COL", played: 3, won: 0, drawn: 1, lost: 2, gf: 2, ga: 6, points: 1, form: ["D", "L", "L"] },
    ],
  },
  {
    name: "Group D",
    teams: [
      { id: "bra", position: 1, name: "Brazil", code: "BRA", played: 3, won: 3, drawn: 0, lost: 0, gf: 8, ga: 2, points: 9, form: ["W", "W", "W"] },
      { id: "eng", position: 2, name: "England", code: "ENG", played: 3, won: 2, drawn: 0, lost: 1, gf: 5, ga: 3, points: 6, form: ["W", "L", "W"] },
      { id: "uru", position: 3, name: "Uruguay", code: "URU", played: 3, won: 1, drawn: 0, lost: 2, gf: 3, ga: 4, points: 3, form: ["L", "W", "L"] },
      { id: "sen", position: 4, name: "Senegal", code: "SEN", played: 3, won: 0, drawn: 0, lost: 3, gf: 1, ga: 8, points: 0, form: ["L", "L", "L"] },
    ],
  },
];

export function getLiveGroups(): GroupData[] {
  return liveGroups;
}

// ---------- Knockout bracket ----------

// FIFA World Cup 2026 — 48 teams, 12 groups (A–L), Round of 32 onward.
// Source feed (season 26618) currently exposes only the group stage, so every
// knockout slot is a placeholder labelled by group position. Group → letter is
// taken from the group_id order in the feed (253019=A … 253030=L). Bracket
// pairings follow the published match schedule (matches 73–104); exact
// best-third assignments are finalised once the group stage completes.
const ph = (label: string): KnockoutSide => ({ name: label, code: "", placeholder: true });

const liveKnockoutRounds: KnockoutRound[] = [
  {
    id: "r32",
    title: "Round of 32",
    matches: [
      { id: "r32-73", date: "28 Jun", home: ph("1A"), away: ph("2B"), status: "upcoming" },
      { id: "r32-74", date: "28 Jun", home: ph("1C"), away: ph("2D"), status: "upcoming" },
      { id: "r32-75", date: "29 Jun", home: ph("1E"), away: ph("2F"), status: "upcoming" },
      { id: "r32-76", date: "29 Jun", home: ph("1G"), away: ph("2H"), status: "upcoming" },
      { id: "r32-77", date: "29 Jun", home: ph("1I"), away: ph("2J"), status: "upcoming" },
      { id: "r32-78", date: "30 Jun", home: ph("1K"), away: ph("2L"), status: "upcoming" },
      { id: "r32-79", date: "30 Jun", home: ph("1B"), away: ph("2A"), status: "upcoming" },
      { id: "r32-80", date: "30 Jun", home: ph("1D"), away: ph("2C"), status: "upcoming" },
      { id: "r32-81", date: "01 Jul", home: ph("1F"), away: ph("2E"), status: "upcoming" },
      { id: "r32-82", date: "01 Jul", home: ph("1H"), away: ph("2G"), status: "upcoming" },
      { id: "r32-83", date: "01 Jul", home: ph("1J"), away: ph("2I"), status: "upcoming" },
      { id: "r32-84", date: "02 Jul", home: ph("1L"), away: ph("2K"), status: "upcoming" },
      { id: "r32-85", date: "02 Jul", home: ph("3rd"), away: ph("3rd"), status: "upcoming" },
      { id: "r32-86", date: "02 Jul", home: ph("3rd"), away: ph("3rd"), status: "upcoming" },
      { id: "r32-87", date: "03 Jul", home: ph("3rd"), away: ph("3rd"), status: "upcoming" },
      { id: "r32-88", date: "03 Jul", home: ph("3rd"), away: ph("3rd"), status: "upcoming" },
    ],
  },
  {
    id: "r16",
    title: "Round of 16",
    matches: [
      { id: "r16-89", date: "04 Jul", home: ph("W73"), away: ph("W74"), status: "upcoming" },
      { id: "r16-90", date: "04 Jul", home: ph("W75"), away: ph("W76"), status: "upcoming" },
      { id: "r16-91", date: "05 Jul", home: ph("W77"), away: ph("W78"), status: "upcoming" },
      { id: "r16-92", date: "05 Jul", home: ph("W79"), away: ph("W80"), status: "upcoming" },
      { id: "r16-93", date: "06 Jul", home: ph("W81"), away: ph("W82"), status: "upcoming" },
      { id: "r16-94", date: "06 Jul", home: ph("W83"), away: ph("W84"), status: "upcoming" },
      { id: "r16-95", date: "07 Jul", home: ph("W85"), away: ph("W86"), status: "upcoming" },
      { id: "r16-96", date: "07 Jul", home: ph("W87"), away: ph("W88"), status: "upcoming" },
    ],
  },
  {
    id: "qf",
    title: "Quarter-finals",
    matches: [
      { id: "qf-97",  date: "09 Jul", home: ph("W89"), away: ph("W90"), status: "upcoming" },
      { id: "qf-98",  date: "10 Jul", home: ph("W91"), away: ph("W92"), status: "upcoming" },
      { id: "qf-99",  date: "10 Jul", home: ph("W93"), away: ph("W94"), status: "upcoming" },
      { id: "qf-100", date: "11 Jul", home: ph("W95"), away: ph("W96"), status: "upcoming" },
    ],
  },
  {
    id: "sf",
    title: "Semi-finals",
    matches: [
      { id: "sf-101", date: "14 Jul", home: ph("W97"), away: ph("W98"),  status: "upcoming" },
      { id: "sf-102", date: "15 Jul", home: ph("W99"), away: ph("W100"), status: "upcoming" },
    ],
  },
  {
    id: "3rd",
    title: "Third-place Play-off",
    matches: [{ id: "3rd-103", date: "18 Jul", home: ph("L101"), away: ph("L102"), status: "upcoming" }],
  },
  {
    id: "final",
    title: "Final",
    matches: [{ id: "final-104", date: "19 Jul", home: ph("W101"), away: ph("W102"), status: "upcoming" }],
  },
];

export function getLiveKnockoutRounds(): KnockoutRound[] {
  return liveKnockoutRounds;
}

// ---------- Players ----------

function mp(id: string, commonName: string, fullName: string, teamId: string, nat: string, position: Player["position"], jersey: number, stats: Partial<Player["stats"]> = {}, age = 27, heightCm = 180): Player {
  return {
    id, commonName, fullName, teamId, nationalityCode: nat, position, jersey, age, heightCm,
    stats: { appearances: 3, minutes: 270, goals: 0, assists: 0, yellow: 0, red: 0, shotsOnTarget: 0, ...stats },
  };
}

const players: Player[] = [
  mp("p-mex-1", "G. Ochoa", "Guillermo Ochoa", "mex", "MEX", "GK", 13, {}, 40, 185),
  mp("p-mex-2", "C. Salcedo", "Carlos Salcedo", "mex", "MEX", "DF", 3, { yellow: 2, red: 1 }, 31),
  mp("p-mex-3", "E. Álvarez", "Edson Álvarez", "mex", "MEX", "MF", 4, { assists: 1, yellow: 1, shotsOnTarget: 2 }, 27),
  mp("p-mex-4", "H. Lozano", "Hirving Lozano", "mex", "MEX", "FW", 22, { minutes: 250, goals: 2, assists: 1, shotsOnTarget: 6 }, 29),
  mp("p-mex-5", "S. Giménez", "Santiago Giménez", "mex", "MEX", "FW", 9, { minutes: 240, goals: 3, shotsOnTarget: 8 }, 24),
  mp("p-fra-1", "M. Maignan", "Mike Maignan", "fra", "FRA", "GK", 16, {}, 30),
  mp("p-fra-2", "T. Hernandez", "Theo Hernandez", "fra", "FRA", "DF", 22, { assists: 1, yellow: 2 }, 28),
  mp("p-fra-3", "A. Tchouaméni", "Aurélien Tchouaméni", "fra", "FRA", "MF", 8, { yellow: 3 }, 26),
  mp("p-fra-4", "K. Mbappé", "Kylian Mbappé", "fra", "FRA", "FW", 10, { goals: 4, assists: 2, shotsOnTarget: 11 }, 27, 178),
  mp("p-fra-5", "O. Dembélé", "Ousmane Dembélé", "fra", "FRA", "FW", 11, { minutes: 240, goals: 1, assists: 2, shotsOnTarget: 5 }, 28),
  mp("p-bra-1", "Alisson", "Alisson Becker", "bra", "BRA", "GK", 1, {}, 33),
  mp("p-bra-2", "Marquinhos", "Marquinhos", "bra", "BRA", "DF", 4, { yellow: 1 }, 31),
  mp("p-bra-3", "Casemiro", "Casemiro", "bra", "BRA", "MF", 5, { yellow: 3, red: 1 }, 34),
  mp("p-bra-4", "Vinícius Jr.", "Vinícius Júnior", "bra", "BRA", "FW", 7, { goals: 3, assists: 3, yellow: 1, shotsOnTarget: 9 }, 25),
  mp("p-bra-5", "Rodrygo", "Rodrygo Goes", "bra", "BRA", "FW", 9, { minutes: 240, goals: 2, shotsOnTarget: 7 }, 25),
  mp("p-kor-1", "J. Kim", "Jo Hyeon-woo", "kor", "KOR", "GK", 1, {}, 33),
  mp("p-kor-2", "M. Kim", "Kim Min-jae", "kor", "KOR", "DF", 4, { yellow: 2 }, 29),
  mp("p-kor-3", "I. Lee", "Lee Kang-in", "kor", "KOR", "MF", 18, { minutes: 250, goals: 1, assists: 1, shotsOnTarget: 3 }, 25),
  mp("p-kor-4", "H. Son", "Son Heung-min", "kor", "KOR", "FW", 7, { goals: 2, assists: 1, shotsOnTarget: 6 }, 33, 183),
  mp("p-kor-5", "U. Hwang", "Hwang Ui-jo", "kor", "KOR", "FW", 11, { appearances: 2, minutes: 140, goals: 1, yellow: 1, red: 1, shotsOnTarget: 2 }, 33),
];

export function getPlayersForTeam(teamId: string): Player[] {
  return players.filter((p) => p.teamId === teamId);
}

export function getPlayerById(id: string): Player | undefined {
  return players.find((p) => p.id === id);
}

// ---------- Team profile ----------

export type TeamProfile = {
  team: Team;
  formation: string;
  recentForm: ("W" | "D" | "L")[];
  squad: Player[];
};

const teamProfiles: Record<string, { formation: string; recentForm: ("W" | "D" | "L")[] }> = {
  mex: { formation: "4-3-3", recentForm: ["W", "W", "D", "L", "W"] },
  fra: { formation: "4-2-3-1", recentForm: ["W", "W", "W", "D", "W"] },
  bra: { formation: "4-3-3", recentForm: ["W", "W", "W", "W", "D"] },
  kor: { formation: "4-2-3-1", recentForm: ["L", "D", "W", "W", "L"] },
  usa: { formation: "4-3-3", recentForm: ["L", "W", "D", "W", "L"] },
  ger: { formation: "4-2-3-1", recentForm: ["W", "D", "W", "W", "L"] },
  eng: { formation: "4-3-3", recentForm: ["W", "L", "W", "D", "W"] },
  arg: { formation: "4-4-2", recentForm: ["W", "W", "D", "W", "W"] },
};

export function getTeamProfile(code: string): TeamProfile | undefined {
  const team = getTeamByCode(code);
  if (!team) return undefined;
  const base = teamProfiles[team.id] ?? { formation: "4-3-3", recentForm: ["W", "D", "L", "W", "D"] as ("W" | "D" | "L")[] };
  return { team, ...base, squad: getPlayersForTeam(team.id) };
}

// ---------- Match detail ----------

function buildLineup(teamCode: string): LineupPlayer[] {
  const team = getTeamByCode(teamCode);
  if (!team) return [];
  const squad = getPlayersForTeam(team.id);
  const starters: LineupPlayer[] = squad.slice(0, 5).map((p) => ({
    playerId: p.id, jersey: p.jersey, name: p.commonName, position: p.position, isStarter: true,
  }));
  const placeholders: LineupPlayer[] = Array.from({ length: Math.max(0, 11 - starters.length) }).map((_, i) => ({
    playerId: `${teamCode.toLowerCase()}-x${i + 1}`,
    jersey: 14 + i,
    name: `${teamCode} Player ${14 + i}`,
    position: i < 2 ? "DF" : i < 4 ? "MF" : "FW",
    isStarter: true,
  }));
  return [...starters, ...placeholders];
}

const matchDetailSeeds: Record<string, { homeFormation: string; awayFormation: string; events: MatchEvent[]; stats: MatchStatLine[] }> = {
  "1": {
    homeFormation: "4-3-3",
    awayFormation: "4-2-3-1",
    events: [
      { id: "e1", minute: 12, type: "goal", teamSide: "home", playerName: "H. Lozano", detail: "Right-footed shot" },
      { id: "e2", minute: 34, type: "yellow", teamSide: "away", playerName: "K. Min-jae", detail: "Tactical foul" },
      { id: "e3", minute: 58, type: "goal", teamSide: "away", playerName: "H. Son", detail: "Header" },
      { id: "e4", minute: 71, type: "sub", teamSide: "home", playerName: "S. Giménez", detail: "On for Lozano" },
      { id: "e5", minute: 83, type: "goal", teamSide: "home", playerName: "S. Giménez", detail: "Close range finish" },
    ],
    stats: [
      { label: "Possession", home: 54, away: 46, unit: "%" },
      { label: "Shots", home: 14, away: 9 },
      { label: "Shots on target", home: 6, away: 3 },
      { label: "Corners", home: 7, away: 4 },
      { label: "Fouls", home: 11, away: 14 },
      { label: "Pass accuracy", home: 87, away: 81, unit: "%" },
    ],
  },
  "2": {
    homeFormation: "4-3-3",
    awayFormation: "4-2-3-1",
    events: [
      { id: "e1", minute: 8, type: "goal", teamSide: "away", playerName: "K. Mbappé", detail: "Cut inside, low shot" },
      { id: "e2", minute: 42, type: "goal", teamSide: "home", playerName: "C. Pulisic" },
      { id: "e3", minute: 67, type: "goal", teamSide: "away", playerName: "O. Dembélé" },
      { id: "e4", minute: 90, type: "goal", teamSide: "away", playerName: "K. Mbappé", detail: "Counter-attack" },
    ],
    stats: [
      { label: "Possession", home: 42, away: 58, unit: "%" },
      { label: "Shots", home: 8, away: 17 },
      { label: "Shots on target", home: 3, away: 8 },
      { label: "Corners", home: 3, away: 6 },
      { label: "Fouls", home: 13, away: 9 },
      { label: "Pass accuracy", home: 79, away: 88, unit: "%" },
    ],
  },
};

export function getMatchDetail(matchId: string): MatchDetailData | undefined {
  const match = getMatchById(matchId);
  if (!match) return undefined;
  const venue = getVenueById(match.venueId)!;
  const seed = matchDetailSeeds[matchId] ?? {
    homeFormation: "4-3-3",
    awayFormation: "4-3-3",
    events: [],
    stats: [
      { label: "Possession", home: 50, away: 50, unit: "%" },
      { label: "Shots", home: 0, away: 0 },
      { label: "Shots on target", home: 0, away: 0 },
      { label: "Corners", home: 0, away: 0 },
      { label: "Fouls", home: 0, away: 0 },
      { label: "Pass accuracy", home: 0, away: 0, unit: "%" },
    ],
  };

  const h2hSeeds = [
    { date: "2022-11-23", home: match.homeTeam.code, away: match.awayTeam.code, hs: 0, as: 0 },
    { date: "2018-06-23", home: match.awayTeam.code, away: match.homeTeam.code, hs: 2, as: 1 },
    { date: "2014-06-13", home: match.homeTeam.code, away: match.awayTeam.code, hs: 1, as: 1 },
    { date: "2010-06-17", home: match.awayTeam.code, away: match.homeTeam.code, hs: 0, as: 2 },
  ];

  return {
    match,
    venue,
    homeFormation: seed.homeFormation,
    awayFormation: seed.awayFormation,
    homeLineup: buildLineup(match.homeTeam.code),
    awayLineup: buildLineup(match.awayTeam.code),
    events: seed.events,
    stats: seed.stats,
    h2h: h2hSeeds.map((h) => ({
      date: h.date,
      home: getTeamByCode(h.home)!,
      away: getTeamByCode(h.away)!,
      homeScore: h.hs,
      awayScore: h.as,
    })),
  };
}

// ---------- Top scorers ----------

export function getTopScorers(): TopScorer[] {
  return [...players]
    .sort((a, b) => b.stats.goals - a.stats.goals || b.stats.assists - a.stats.assists)
    .slice(0, 10)
    .map((p, i) => {
      const team = teamList.find((tm) => tm.id === p.teamId)!;
      return {
        rank: i + 1,
        playerId: p.id,
        name: p.commonName,
        teamCode: team.code,
        teamName: team.name,
        nationalityCode: p.nationalityCode,
        goals: p.stats.goals,
        assists: p.stats.assists,
        minutes: p.stats.minutes,
      };
    });
}

function statForCategory(p: Player, category: LeaderboardCategory): number {
  switch (category) {
    case "goals": return p.stats.goals;
    case "assists": return p.stats.assists;
    case "yellow": return p.stats.yellow;
    case "red": return p.stats.red;
    case "shotsOnTarget": return p.stats.shotsOnTarget;
  }
}

export function getLeaderboard(category: LeaderboardCategory, limit = 10): LeaderboardEntry[] {
  return [...players]
    .filter((p) => statForCategory(p, category) > 0)
    .sort((a, b) => statForCategory(b, category) - statForCategory(a, category) || b.stats.minutes - a.stats.minutes)
    .slice(0, limit)
    .map((p, i) => {
      const team = teamList.find((tm) => tm.id === p.teamId)!;
      return {
        rank: i + 1,
        playerId: p.id,
        name: p.commonName,
        teamCode: team.code,
        teamName: team.name,
        nationalityCode: p.nationalityCode,
        value: statForCategory(p, category),
        minutes: p.stats.minutes,
      };
    });
}

export function hasLiveMatches(ms: Match[]): boolean {
  return ms.some((m) => m.status === "live");
}
