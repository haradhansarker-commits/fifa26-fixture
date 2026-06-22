import { useState, useEffect, useCallback } from "react";
import type { Match, GroupData, KnockoutRound, MatchDetailData } from "./liveData";
import {
  fetchFixtures, fetchStandings, fetchKnockout, fetchMatchDetail, fetchLeaderboards, fetchTeamProfile, loadMatches,
  type LbCategory, type LbEntry, type TeamProfileData,
} from "./fifaData";

const EMPTY_LEADERBOARDS: Record<LbCategory, LbEntry[]> = { goals: [], assists: [], shots: [], yellow: [], red: [] };

// Live data from the public FIFA API. See fifaData.ts for endpoints/mapping.
// Fixtures/knockout poll periodically so in-progress matches refresh.

export type AsyncState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  /** Epoch ms of the last successful load; null until the first one lands. */
  updatedAt: number | null;
  /** Force a fresh fetch now (used by manual retry). */
  refetch: () => void;
};

function useAsync<T>(loader: () => Promise<T>, initial: T, deps: unknown[], pollMs?: number): AsyncState<T> {
  const [state, setState] = useState<Omit<AsyncState<T>, "refetch">>({
    data: initial,
    loading: true,
    error: null,
    updatedAt: null,
  });
  // Bumping this re-runs the effect with a forced (cache-busting) load.
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;

    const run = (force = false) => {
      if (force) loadMatches(true);
      loader()
        .then((data) => alive && setState((s) => ({ ...s, data, loading: false, error: null, updatedAt: Date.now() })))
        .catch((e) => alive && setState((s) => ({ ...s, loading: false, error: String(e?.message ?? e) })));
    };

    run(nonce > 0);
    const timer = pollMs ? setInterval(() => run(true), pollMs) : null;
    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const refetch = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    setNonce((n) => n + 1);
  }, []);

  return { ...state, refetch };
}

export function useFixtures(): AsyncState<Match[]> {
  return useAsync(fetchFixtures, [], [], 60_000);
}

export function useStandings(): AsyncState<GroupData[]> {
  return useAsync(fetchStandings, [], [], 60_000);
}

export function useKnockout(): AsyncState<KnockoutRound[]> {
  return useAsync(fetchKnockout, [], [], 60_000);
}

export function useMatchDetail(matchId: string): AsyncState<MatchDetailData | undefined> {
  return useAsync(() => fetchMatchDetail(matchId), undefined, [matchId], 30_000);
}

export function useLeaderboards(): AsyncState<Record<LbCategory, LbEntry[]>> {
  return useAsync(fetchLeaderboards, EMPTY_LEADERBOARDS, []);
}

export function useTeamProfile(code: string): AsyncState<TeamProfileData | undefined> {
  return useAsync(() => fetchTeamProfile(code), undefined, [code], 60_000);
}

// ---- Back-compat thin wrappers (older call sites) ----

export function useLiveFixtures(): Match[] {
  return useFixtures().data;
}

export function useLiveMatchDetail(matchId: string): MatchDetailData | undefined {
  return useMatchDetail(matchId).data;
}

// Reads /watch-links.json — edit that file to configure stream URLs per match.
export function useWatchLink(matchId: string): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/watch-links.json")
      .then((r) => r.json())
      .then((cfg: { global?: string; matches?: Record<string, string> }) => {
        setUrl(cfg.matches?.[matchId] ?? cfg.global ?? null);
      })
      .catch(() => setUrl(null));
  }, [matchId]);

  return url;
}

export type HighlightLink = {
  /** YouTube video id, when a specific highlight reel is configured (embeddable). */
  videoId: string | null;
  /** Always-available fallback: a prefilled YouTube search for this fixture. */
  searchUrl: string;
};

// Accepts a bare id, a youtube.com/watch?v= URL, or a youtu.be/ short URL.
function parseYouTubeId(raw: string): string | null {
  if (!raw) return null;
  if (/^[\w-]{11}$/.test(raw)) return raw;
  const m = raw.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

// Reads /highlights.json — map match ids to YouTube highlight video ids/URLs.
// Falls back to a YouTube search built from the fixture so the button always
// leads somewhere even when no exact reel is configured. Team names are optional
// so this can be called before the match detail has loaded (rules of hooks).
export function useHighlightLink(matchId: string, homeName?: string, awayName?: string): HighlightLink {
  const [videoId, setVideoId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/highlights.json")
      .then((r) => r.json())
      .then((cfg: { matches?: Record<string, string> }) => {
        if (alive) setVideoId(parseYouTubeId(cfg.matches?.[matchId] ?? ""));
      })
      .catch(() => alive && setVideoId(null));
    return () => {
      alive = false;
    };
  }, [matchId]);

  const teams = homeName && awayName ? `${homeName} vs ${awayName} ` : "";
  const query = `FIFA World Cup 2026 ${teams}highlights`;
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

  return { videoId, searchUrl };
}
