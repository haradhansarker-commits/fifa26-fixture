# Product

## Register

product

## Users

Football fans following the 2026 World Cup in real time — checking scores between or during matches, tracking their nation through the group stage and knockout bracket, settling "who's top scorer" arguments. Mostly on phones, often mid-match with a glance-and-go attention budget; sometimes on tablet/desktop for the lineup and bracket views. They are fluent in scoreboards and standings tables; they want the number fast and correct, not a tour.

## Product Purpose

A fast, mobile-first web app for the 2026 World Cup: all 104 fixtures grouped by day with live scores, 12 group tables computed live with full FIFA tiebreakers, the complete Round-of-32→Final knockout bracket, match detail with a pitch lineup and event timeline, and tournament leaders. Sourced entirely from FIFA's public API through an edge-cached proxy — no paid API, no database. Success = a fan trusts the score and the standings order without double-checking elsewhere, and the page is usable the instant it loads.

## Brand Personality

Sporty, fast, precise. Three words: **kinetic, trustworthy, lean.** Voice is a confident match-day broadcast graphic, not a chatty companion. Energy lives in the volt-lime accent and motion that conveys live state (a kickoff, a goal, a refresh) — never in decoration. The data is the hero; the chrome gets out of its way.

## Anti-references

- **Betting / odds apps** — no flashing odds, no aggressive red/green money signals, no urgency-manufacturing loudness. Live state is informative, not a casino.
- **Generic SaaS dashboard** — no cards-everywhere, no gray-on-white soulless admin grid, no rounded-box-per-stat reflex. This is a sports surface with identity, not an analytics console.

## Design Principles

1. **The number, instantly.** Score, standing, rank — readable at a glance, correct before pretty. Skeletons over spinners; never block the data behind choreography.
2. **Live is a state, not a spectacle.** Motion and the lime accent mark what's actually happening (a live match, a goal, a poll refresh). If nothing changed, nothing moves.
3. **Trust through rigor.** Standings show the real FIFA tiebreaker order; placeholders (`2A`, `W73`) are honest about what isn't decided yet. Never fake certainty.
4. **Mobile is the home screen.** Designed thumb-first for mid-match glances; tablet/desktop earn the denser lineup and bracket views, not the reverse.
5. **Identity without noise.** Volt lime + electric purple carry the brand; density and restraint carry the credibility. Earned familiarity, sports-flavored.

## Accessibility & Inclusion

WCAG 2.1 AA. Body text ≥4.5:1, large/bold ≥3:1 — watch the volt-lime `#C6FF1A`, which only passes against dark foregrounds, so never use it as text on light surfaces. Full keyboard navigation for the date scrubber, bracket, and match navigation. `prefers-reduced-motion` alternative for every live/refresh animation. Don't encode live/result state in color alone (the betting-app trap) — pair with text, icon, or position so color-blind users and color-only-as-meaning fail-states are covered.
