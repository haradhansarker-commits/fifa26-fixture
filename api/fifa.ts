// Cached proxy for the public FIFA API.
//
// Why: instead of every visitor hitting api.fifa.com, the browser calls this
// function and Vercel's edge serves a cached copy. The FIFA origin is refreshed
// at most every 10 minutes — or every 30 seconds when a match is in progress
// (detected by "MatchStatus":3 anywhere in the payload).
//
// Only api.fifa.com/api/v3 URLs are allowed (prevents open-proxy / SSRF abuse).

const ALLOWED_PREFIX = "https://api.fifa.com/api/v3/";

const TEN_MINUTES = 600;
const THIRTY_SECONDS = 30;
const UPSTREAM_TIMEOUT_MS = 8000;

// Cap how long the function itself may run, so a stuck FIFA origin returns fast
// instead of hanging up to Vercel's default (300 s) and blocking the browser.
export const config = { maxDuration: 12 };

export default async function handler(req: any, res: any) {
  const u = req.query?.u;
  const target = Array.isArray(u) ? u[0] : u;

  if (typeof target !== "string" || !target.startsWith(ALLOWED_PREFIX)) {
    res.status(400).json({ error: "Invalid or missing 'u' parameter" });
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch(target, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
      signal: controller.signal,
    });
    const body = await upstream.text();

    // A live match anywhere in the response → short TTL; otherwise 10 minutes.
    const isLive = body.includes('"MatchStatus":3');
    const ttl = isLive ? THIRTY_SECONDS : TEN_MINUTES;

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      `public, s-maxage=${ttl}, stale-while-revalidate=${ttl * 2}`,
    );
    res.status(upstream.status).send(body);
  } catch (e: any) {
    const timedOut = e?.name === "AbortError";
    res.status(timedOut ? 504 : 502).json({
      error: timedOut ? "Upstream FIFA API timed out" : "Upstream FIFA API request failed",
    });
  } finally {
    clearTimeout(timer);
  }
}
