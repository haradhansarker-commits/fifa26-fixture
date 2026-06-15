import { getLiveMatches, getMatchDetail, type Match, type MatchEvent, type MatchDetailData } from "./liveData";

type Listener = () => void;

type ScriptedEvent = {
  minute: number;
  type: MatchEvent["type"];
  teamSide: "home" | "away";
  playerName: string;
  detail?: string;
};

// Pre-scripted events per match. Goals auto-update the score.
const SCRIPTS: Record<string, ScriptedEvent[]> = {
  "4": [
    // BRA (home, 1-0) vs ENG (away) — live at 67'
    { minute: 73, type: "goal",   teamSide: "away", playerName: "H. Kane",      detail: "Penalty" },
    { minute: 78, type: "yellow", teamSide: "home", playerName: "Casemiro",     detail: "Reckless challenge" },
    { minute: 82, type: "goal",   teamSide: "home", playerName: "Vinicius Jr.", detail: "Right-footed finish" },
    { minute: 87, type: "sub",    teamSide: "away", playerName: "Rashford",     detail: "On for Saka" },
    { minute: 90, type: "yellow", teamSide: "away", playerName: "J. Gomez",     detail: "Dissent" },
  ],
  "5": [
    // ITA (home) vs NGA (away) — auto-starts when match 4 finishes
    { minute: 14, type: "goal",   teamSide: "home", playerName: "F. Chiesa",        detail: "Left-footed drive" },
    { minute: 29, type: "yellow", teamSide: "away", playerName: "V. Osimhen",       detail: "Simulation" },
    { minute: 51, type: "goal",   teamSide: "home", playerName: "N. Barella",       detail: "Long range" },
    { minute: 68, type: "red",    teamSide: "away", playerName: "C. Troost-Ekong",  detail: "Second yellow" },
    { minute: 74, type: "goal",   teamSide: "away", playerName: "S. Chukwueze",     detail: "Consolation" },
    { minute: 82, type: "sub",    teamSide: "home", playerName: "Raspadori",        detail: "On for Chiesa" },
  ],
};

// IDs to auto-start (in order) once the current live match finishes.
const AUTO_START_QUEUE = ["5", "6"];

// ---- Mutable singleton state ----
let matches: Match[] = getLiveMatches().map((m) => ({ ...m }));
let firedEvents: Record<string, MatchEvent[]> = {};
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((fn) => fn());
}

function applyEventsAtMinute(matchId: string, minute: number, m: Match): Match {
  const toFire = (SCRIPTS[matchId] ?? []).filter((e) => e.minute === minute);
  if (toFire.length === 0) return m;

  const newEvents: MatchEvent[] = toFire.map((e, i) => ({
    id: `sim-${matchId}-${minute}-${i}`,
    minute: e.minute,
    type: e.type,
    teamSide: e.teamSide,
    playerName: e.playerName,
    detail: e.detail,
  }));

  firedEvents = { ...firedEvents, [matchId]: [...(firedEvents[matchId] ?? []), ...newEvents] };

  let updated = { ...m };
  for (const e of toFire) {
    if (e.type === "goal") {
      if (e.teamSide === "home") updated.homeScore = (updated.homeScore ?? 0) + 1;
      else updated.awayScore = (updated.awayScore ?? 0) + 1;
    }
  }
  return updated;
}

function tick() {
  let changed = false;
  let matchJustFinished = false;

  const updated = matches.map((m) => {
    if (m.status !== "live") return m;

    const newMinute = (m.minute ?? 0) + 1;
    let next = applyEventsAtMinute(m.id, newMinute, m);

    if (newMinute >= 90) {
      next = { ...next, status: "finished", minute: 90 };
      matchJustFinished = true;
    } else {
      next = { ...next, minute: newMinute };
    }

    changed = true;
    return next;
  });

  matches = updated;

  if (matchJustFinished) {
    const nextId = AUTO_START_QUEUE.find((id) => matches.find((m) => m.id === id)?.status === "upcoming");
    if (nextId) {
      matches = matches.map((m) =>
        m.id === nextId ? { ...m, status: "live", minute: 0, homeScore: 0, awayScore: 0 } : m
      );
    }
  }

  if (changed) notify();
}

// ---- Public API ----
let timerId: ReturnType<typeof setInterval> | null = null;

export function startSimulator() {
  if (timerId) return;
  timerId = setInterval(tick, 1000);
}

export function stopSimulator() {
  if (timerId) { clearInterval(timerId); timerId = null; }
}

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getSimMatches(): Match[] {
  return matches;
}

export function getSimMatchDetail(matchId: string): MatchDetailData | undefined {
  const base = getMatchDetail(matchId);
  if (!base) return undefined;
  const simMatch = matches.find((m) => m.id === matchId);
  return {
    ...base,
    match: simMatch ?? base.match,
    events: [...base.events, ...(firedEvents[matchId] ?? [])],
  };
}
