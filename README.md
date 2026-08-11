# Malaysia Election Intelligence

An independent, unofficial intelligence platform tracking Malaysia's rolling 2025–2028 state election cycle through to the next general election (GE16) — histories, constituency-level results, party positioning, and public/professional sentiment, in one connected structure.

**Live site:** https://yifeng22100.github.io/malaysia-election-sentiment/

Malaysia doesn't hold its state elections all at once — each state assembly runs on its own five-year clock. This project follows that rolling sequence one state at a time (Sabah → Johor → Negeri Sembilan → …), while also holding the federal picture, the full electoral history back to 1955, and a 20+ party encyclopedia, so any one result can be read in context rather than in isolation.

## What's here

- **Rolling state coverage** — a dedicated page per state (13), each with a topline result or countdown, a signal log, and — for every state with a certified result — an interactive assembly hemicycle and constituency map/table.
- **Constituency-level results** — every seat's representative, party, runner-up, vote share, majority and total votes, toggleable between a choropleth map and a sortable table, for GE15 and every decided state election.
- **Federal / GE16 picture** — the Dewan Rakyat as GE15 left it, a full party-by-party breakdown (no seat lumped into "Others"), results by state, seats that changed allegiance between elections (grouped by coalition lineage, not raw code, so a rebrand like Pakatan Rakyat → Pakatan Harapan isn't counted as a flip), and MPs who didn't recontest.
- **Electoral history** — an interactive timeline of all 16 general elections since 1955, a Prime Ministers reference, how Malaysian elections are actually triggered and run, and how Parliament (Dewan Rakyat + Dewan Negara) works.
- **Party encyclopedia** — 20+ parties with history, ideology and how they're publicly discussed, each attributed to identifiable sources rather than editorial opinion.
- **Sentiment, two kinds, clearly labelled** — a green **Professional research** badge for named-pollster surveys with disclosed methodology (Merdeka Center, Ilham Centre, Vodus Research), and a blue **Public / social reaction** badge for what's being said on Facebook, X, TikTok, Instagram or forums, as reported by outlets covering that reaction. The two are never blended into one number, and the site has no direct access to any social platform — see [`about.html#methodology`](about.html#methodology).
- **Interactive, not just readable** — click a hemicycle legend chip to highlight that party's seats and filter the constituency table below it; filter a signal log to one category; numbers count up as you scroll to them; cards and log entries reveal as they enter view instead of arriving as a wall of text.
- **Daily automation** — a scheduled job checks for genuinely new developments each day, updates the relevant pages, and publishes the change. See [Daily update automation](#daily-update-automation) below.

## Structure

```
index.html              Overview — cross-state signal log, national picture
johor.html, negeri-sembilan.html, sabah.html, melaka.html, sarawak.html
selangor.html, penang.html, perak.html, pahang.html, kedah.html,
kelantan.html, terengganu.html, perlis.html    13 state pages
federal.html             Federal / GE16 — results tables, hemicycle, polling
history.html             Election Commission profile + all 16 GE timeline
process.html             How Malaysian elections are triggered and run
parliament.html          Dewan Rakyat / Dewan Negara reference
prime-ministers.html     All Prime Ministers, achievements and criticisms
parties.html             20+ party encyclopedia
about.html               Methodology, scope, limits, credits (4 languages)

styles.css               Single shared stylesheet
i18n.js                  Lightweight i18n for shared chrome (nav/footer/labels)
toc.js                   Auto-generated "on this page" sidebar
hemicycle.js             SVG assembly seat diagrams, click-to-filter
electionmap.js           Constituency choropleth + sortable results table
results-tables.js        Data-driven party/state/changed-seat/MP tables
interactive.js           Scroll-reveal, count-up numbers, signal-log filter

data/                    GeoJSON boundaries, per-election results, lookup tables
  results/GE-*.json          Every general election, 1955–2022
  dun_<state>.geojson         State assembly constituency boundaries + results
  parlimen_ge15.geojson       Federal constituency boundaries + results
  tables/                     Party breakdown, by-state, changed-seats, MP-retirement JSON
  SOURCES.md                  Full data provenance and licensing notes
```

## Data sources

- **Boundaries and candidate-level results**: [ElectionData.MY](https://electiondata.my/), dedicated to the public domain (CC0). Boundary geometry is simplified for web delivery and is not suitable for official, legal or survey use — see `data/SOURCES.md` for exact simplification parameters and per-file provenance.
- **Polling**: Merdeka Center, Ilham Centre and Vodus Research, each explicitly attributed when cited.
- **Everything else** (signal logs, party profiles, historical narrative): synthesised from public news coverage — mainstream outlets, wire services, official statements — found through web search. No proprietary data feed, no paid polling access.

## Daily update automation

A scheduled Claude Code invocation runs once a day, driven by [`.github/daily-update-prompt.txt`](.github/daily-update-prompt.txt) — the single canonical prompt, shared by both places this runs — which tiers every page by how often it plausibly changes (active signal logs checked every run; historical reference pages only on a specific documented trigger, e.g. a new PM taking office or a general election being held). It searches for genuinely new developments, edits only what changed, verifies the page still parses and every map/hemicycle reference resolves, commits, and pushes. A post-push step then polls the GitHub Actions API to confirm the Pages deployment actually succeeded, not just that the commit landed.

It runs in two places, either of which is sufficient on its own:

- **Locally**, via a `launchd` job (`~/.malaysia-election-tracker/run-daily-update.sh`) at 08:10 Malaysia time — only runs while that Mac is on and awake.
- **In the cloud**, via [`.github/workflows/daily-update.yml`](.github/workflows/daily-update.yml), a GitHub Actions workflow on the same schedule — runs regardless of any local machine's state. Requires an `ANTHROPIC_API_KEY` repository secret (Settings → Secrets and variables → Actions); billed per the Anthropic API's standard pricing, separate from a claude.ai subscription. Can also be triggered manually from the Actions tab (`workflow_dispatch`).

Both write to the same repo and only commit when they find something genuinely new, so an overlapping run is a harmless no-op rather than a duplicate post.

## Running locally

No build step — it's static HTML/CSS/JS. From this directory:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.

## Contributing / corrections

The source is fully public. If you spot a factual error or a translation issue (particularly in the Tamil interface, produced with AI assistance rather than native-speaking review), open an issue or PR on GitHub.

## Disclaimer

This is an independent, unofficial, non-commercial project. It is not affiliated with the Election Commission of Malaysia, any political party or coalition, any government body, or any news organisation quoted. Party logos and flags appear for identification purposes only, sourced from Wikimedia Commons, and remain the trademarks of their respective parties. See [`about.html`](about.html) for the full methodology and neutrality statement.

---

Built and maintained with [Claude](https://claude.com) (Anthropic), hosted free on GitHub Pages.
