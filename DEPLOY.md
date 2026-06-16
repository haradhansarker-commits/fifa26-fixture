# ☁️ Deploying & configuring on Vercel

This project deploys to Vercel with **zero config** and pulls updates straight from GitHub. Below is the full setup plus how to verify the cached FIFA proxy is working after deployment.

---

## 1. Connect the repo (one-time)

1. Go to **[vercel.com/new](https://vercel.com/new)** → **Import Git Repository**.
2. Pick `haradhansarker-commits/fifa26-fixture`.
3. Vercel auto-detects the settings below — leave them as-is:

   | Setting | Value |
   |---|---|
   | **Framework Preset** | `Vite` |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |
   | **Root Directory** | `./` |

4. **Environment variables:** none required.
5. Click **Deploy**.

> Already linked? Then every push to `main` redeploys automatically — you don't need to do anything in Vercel.

---

## 2. What gets deployed

- **Static site** → the built SPA in `dist/`.
- **Serverless function** → `api/fifa.ts` is detected automatically and exposed at **`/api/fifa`**. No extra config needed.

The browser (in production) requests FIFA data through `/api/fifa?u=…`, and the function returns it with edge-cache headers.

---

## 3. Caching behaviour (already configured in code)

Set inside [`api/fifa.ts`](api/fifa.ts) via `Cache-Control` — no dashboard changes required:

| Situation | Edge cache (`s-maxage`) |
|---|---|
| Normal data (fixtures, standings, finished matches) | **600 s (10 min)** |
| A live match is in progress | **30 s** |

Plus `stale-while-revalidate` so users always get an instant cached response while the edge refreshes in the background. The FIFA origin is therefore hit at most a few times per 10 minutes regardless of traffic.

---

## 4. Verify after deploy

1. **App loads:** open your production URL — fixtures, standings, knockout, leaderboard all populate.
2. **Proxy works:** visit
   ```
   https://<your-app>.vercel.app/api/fifa?u=https%3A%2F%2Fapi.fifa.com%2Fapi%2Fv3%2Fcalendar%2Fmatches%3FidCompetition%3D17%26idSeason%3D285023%26count%3D5%26language%3Den
   ```
   You should get JSON back.
3. **Caching is active:** open browser DevTools → **Network** → reload → click an `/api/fifa…` request and check the response headers:
   - `cache-control: public, s-maxage=600, stale-while-revalidate=1200`
   - `x-vercel-cache: HIT` (after the first request) — confirms the edge is serving the cache.

---

## 5. Optional configuration

### Custom domain
Vercel → Project → **Settings → Domains** → add your domain and follow the DNS steps.

### Watch-live stream links
Edit [`public/watch-links.json`](public/watch-links.json), commit, and push — a **Watch Live** button appears on live matches.
```json
{
  "global": "https://your-default-stream",
  "matches": { "400021443": "https://stream-for-this-match" }
}
```

### Function region (optional)
Default region is fine. To pin the proxy closer to FIFA's origin or your audience, set a region in **Settings → Functions**.

---

## 6. Updating the app

```bash
git add -A
git commit -m "your change"
git push           # Vercel auto-deploys main
```

Preview deployments are created automatically for any non-`main` branch or pull request.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `/api/fifa` returns 404 | Ensure the `api/` folder is committed and the framework preset is **Vite** (not "Other"). Redeploy. |
| `400 Invalid 'u' parameter` | Expected for direct visits without a valid `u`. Only `https://api.fifa.com/api/v3/…` URLs are allowed (anti-abuse). |
| Data looks stale during a live match | Cache is 30 s while live; hard-refresh or wait. Check `x-vercel-cache` / `age` headers. |
| Blank page after deploy | Confirm **Output Directory** is `dist` and **Build Command** is `npm run build`. |
