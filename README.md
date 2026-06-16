<div align="center">

# ⚽ FIFA World Cup 2026™ — Live Fixtures, Standings & Stats

**A fast, mobile-first web app for following the 2026 World Cup — real fixtures, live group standings with full FIFA tiebreakers, the complete knockout bracket, match detail with a pitch lineup, and tournament leaders — all from FIFA's public data.**

No paid API. No database. An edge-cached proxy keeps it fast and light.

### 🔴 [**Live preview → fifa26-fixture.vercel.app**](https://fifa26-fixture.vercel.app/)

![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-deployed-000?logo=vercel&logoColor=white)

</div>

---

## ✨ What it does

| | |
|---|---|
| 📌 **Tournament pulse** | A compact widget up top: the live match (or next kickoff) plus headline numbers — matches played, goals, goals/match. |
| 🗓️ **Fixtures** | All 104 matches grouped by day, live scores, a date scrubber that opens on today and remembers your day across navigation. |
| 📊 **Standings** | All 12 group tables — computed live from results, ordered by the **full FIFA tiebreakers** (head-to-head + fair-play). |
| 🏆 **Knockout** | The complete bracket, Round of 32 → Final, with placeholder slots (`2A`, `W73`…) until teams qualify. |
| 🔎 **Match detail** | A **pitch lineup** (rotates to landscape on tablet/desktop), formations, event timeline, and match stats. |
| 🥇 **Leaderboard** | Tournament leaders for goals, assists, shots, yellow & red cards — tallied from match events. |
| 🚩 **Real flags & teams** | All 48 nations with official flags. |

Live matches refresh every 30 s; everything else on a steady polling loop.

---

## 🛰️ Where the data comes from

Everything is sourced from **FIFA's public API** (`api.fifa.com/api/v3`).

| Data | Endpoint |
|---|---|
| Matches (single source of truth) | `GET /calendar/matches?idCompetition=17&idSeason=285023` |
| Match detail (lineups, formations) | `GET /live/football/17/285023/{stage}/{match}` |
| Event timeline (goals, cards, shots…) | `GET /timelines/17/285023/{stage}/{match}` |
| Flags | `GET /picture/flags-sq-4/{CODE}` |

> `17` = FIFA World Cup™ · `285023` = the 2026 edition.

What's **derived on the client** (FIFA doesn't publish these directly for this season):

- **Standings** — tallied from results, then ordered by points → GD → goals, and for level teams head-to-head (points/GD/goals) → fair-play points → lots.
- **Leaderboards** — aggregated from goal/assist/card/shot timeline events per player.
- **Match stats** — total shots, corners, fouls, offsides from the timeline. (Possession, xG, shots-on-target and throw-ins are **not** in the FIFA feed, so they're omitted rather than faked.)

All mapping lives in [`src/app/services/fifaData.ts`](src/app/services/fifaData.ts).

### ⚡ Edge-cached proxy

In production the browser doesn't hit FIFA directly — it calls [`api/fifa.ts`](api/fifa.ts), a Vercel function that proxies FIFA and caches at the edge:

- **10 minutes** for normal data
- **30 seconds** whenever a match is live

So the FIFA origin is hit rarely and every visitor is served from Vercel's edge. (In local dev there's no function, so the app calls FIFA directly — its CORS is open.)

---

## 🚀 Quick start

```bash
npm install      # install deps
npm run dev      # dev server → http://localhost:5173
npm run build    # production build → dist/
```

No `.env`, no keys, no services to spin up.

---

## 🧱 Tech stack

- **[Vite 6](https://vite.dev/)** — instant dev server + lean build
- **[React 18](https://react.dev/)** + **[React Router 7](https://reactrouter.com/)**
- **[Tailwind CSS v4](https://tailwindcss.com/)** + **[shadcn/ui](https://ui.shadcn.com/)**
- **TypeScript** throughout · **[lucide-react](https://lucide.dev/)** icons
- **[Vercel](https://vercel.com/)** serverless function for the cached proxy

---

## 🗂️ Project structure

```
api/
└── fifa.ts                 # Vercel function: edge-cached FIFA proxy
src/
├── app/
│   ├── components/         # TournamentSummary, FixtureList, LeaderboardTable,
│   │                       #   KnockoutBracket, Flag …
│   ├── pages/              # MatchDetail (pitch lineup + stats), TeamProfile, TopScorers
│   ├── services/
│   │   ├── fifaData.ts     # FIFA fetch + mapping, standings tiebreakers, leaderboards
│   │   ├── useLiveData.ts  # hooks: useFixtures / useStandings / useKnockout /
│   │   │                   #   useMatchDetail / useLeaderboards
│   │   └── liveData.ts     # shared TypeScript types
│   └── routes.tsx
└── main.tsx
```

Every screen consumes a hook returning `{ data, loading, error }`, so the UI and the FIFA integration stay decoupled.

### 📺 Optional: watch links

Map a match to a stream URL in [`public/watch-links.json`](public/watch-links.json) and a **Watch Live** button appears on live matches. Set `global` for a single fallback stream.

---

## ☁️ Deploy on Vercel

This repo is wired for zero-config Vercel deploys — see **[DEPLOY.md](DEPLOY.md)** for the full setup and post-deploy checklist (build settings, the `api/` proxy, caching, and verifying it works).

TL;DR: import the GitHub repo into Vercel, framework **Vite**, build `npm run build`, output `dist`. The `api/fifa.ts` function is detected automatically. No environment variables required.

---

## 🛣️ Roadmap

- [ ] Wire Team profile squads to live FIFA data (currently sample data)
- [ ] Route-level code splitting
- [ ] Tournament-finished / 404 states

---

## 📄 Attribution

Match data and flags © FIFA, via the public `api.fifa.com` endpoints. Independent, non-commercial project — not affiliated with or endorsed by FIFA. UI originated from a [Figma](https://www.figma.com/) design.
