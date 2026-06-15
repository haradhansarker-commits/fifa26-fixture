<div align="center">

# ⚽ FIFA World Cup 2026™ — Live Fixtures & Standings

**A fast, mobile-first web app for following the 2026 World Cup — real fixtures, live group standings, the full knockout bracket, and match detail, all pulled straight from FIFA's public data.**

No backend. No API key. No database. Just open it and watch the tournament unfold.

![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)

</div>

---

## ✨ What it does

| | |
|---|---|
| 🗓️ **Fixtures** | All 104 matches, grouped by day, with live scores, kickoff times, and a quick date scrubber. |
| 📊 **Standings** | All 12 group tables — points, goal difference, and recent form — **computed live** from finished results. |
| 🏆 **Knockout** | The complete bracket from Round of 32 to the Final, with placeholder slots (`2A`, `W73`…) until teams qualify. |
| 🔎 **Match detail** | Starting lineups, formations, a minute-by-minute event timeline, and match stats. |
| 🚩 **Real flags & teams** | Every one of the 48 nations, with official flags. |

Everything updates on a short polling loop, so live matches refresh on their own.

---

## 🛰️ Where the data comes from

The app talks **directly to FIFA's public API** (`api.fifa.com`) from the browser — CORS is open, so there's nothing to host and no token to manage.

| Data | Endpoint |
|---|---|
| Matches (single source of truth) | `GET /api/v3/calendar/matches?idCompetition=17&idSeason=285023` |
| Match detail (lineups, formations) | `GET /api/v3/live/football/17/285023/{stage}/{match}` |
| Event timeline | `GET /api/v3/timelines/17/285023/{stage}/{match}` |
| Flags | `GET /api/v3/picture/flags-sq-4/{CODE}` |

> `17` = FIFA World Cup™ · `285023` = the 2026 edition.

**Standings are derived on the client** from the match feed (wins/draws/losses → points, goal difference, form), because FIFA only publishes the official standing table once the group stage completes. All the mapping lives in [`src/app/services/fifaData.ts`](src/app/services/fifaData.ts).

---

## 🚀 Quick start

```bash
# install
npm install

# run the dev server  →  http://localhost:5173
npm run dev

# production build  →  dist/
npm run build
```

That's it. No `.env`, no keys, no services to spin up.

---

## 🧱 Tech stack

- **[Vite 6](https://vite.dev/)** — instant dev server + lean production build
- **[React 18](https://react.dev/)** + **[React Router 7](https://reactrouter.com/)** — routing & views
- **[Tailwind CSS v4](https://tailwindcss.com/)** + **[shadcn/ui](https://ui.shadcn.com/)** — styling & components
- **TypeScript** throughout
- **[lucide-react](https://lucide.dev/)** — icons

---

## 🗂️ Project structure

```
src/
├── app/
│   ├── components/        # FixtureList, LeaderboardTable, KnockoutBracket, Flag …
│   ├── pages/             # MatchDetail, TeamProfile, PlayerCard, TopScorers
│   ├── services/
│   │   ├── fifaData.ts    # FIFA API fetch + mapping + standings/bracket logic
│   │   ├── useLiveData.ts # React hooks: useFixtures / useStandings / useKnockout / useMatchDetail
│   │   └── liveData.ts    # shared TypeScript types
│   └── routes.tsx
└── main.tsx
```

The data layer is fully decoupled: every screen consumes a hook that returns `{ data, loading, error }`, so the UI and the FIFA integration evolve independently.

### 📺 Optional: watch links

Map a match to a stream URL in [`public/watch-links.json`](public/watch-links.json) and a **Watch Live** button appears on live matches. Set `global` for a single fallback stream across all live games.

---

## 🛣️ Roadmap

- [ ] Wire Top Scorers, Team profile, and Player cards to live FIFA data (currently sample data)
- [ ] Route-level code splitting
- [ ] Tournament-finished / 404 states

---

## 📄 Attribution

Match data and flags © FIFA, via the public `api.fifa.com` endpoints. This is an independent, non-commercial project and is not affiliated with or endorsed by FIFA. UI originated from a [Figma](https://www.figma.com/) design.
