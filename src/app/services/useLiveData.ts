import { useState, useEffect } from "react";
import type { Match, GroupData, KnockoutRound, MatchDetailData } from "./liveData";
import { fetchFixtures, fetchStandings, fetchKnockout, fetchMatchDetail, loadMatches } from "./fifaData";

// Live data from the public FIFA API. See fifaData.ts for endpoints/mapping.
// Fixtures/knockout poll periodically so in-progress matches refresh.

export type AsyncState<T> = { data: T; loading: boolean; error: string | null };

function useAsync<T>(loader: () => Promise<T>, initial: T, deps: unknown[], pollMs?: number): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: initial, loading: true, error: null });

  useEffect(() => {
    let alive = true;

    const run = (force = false) => {
      if (force) loadMatches(true);
      loader()
        .then((data) => alive && setState({ data, loading: false, error: null }))
        .catch((e) => alive && setState((s) => ({ ...s, loading: false, error: String(e?.message ?? e) })));
    };

    run();
    const timer = pollMs ? setInterval(() => run(true), pollMs) : null;
    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
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
