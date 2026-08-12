# Working on this project

Notes for anyone — human or AI agent, on this Mac or anywhere else — picking up this repo. The goal is that none of this depends on a specific machine or a specific chat session: everything that matters is either in the code or in this file.

## Data honesty: never fabricate a fact to fill a gap

This is the site's core discipline, established across many features and never relaxed: when a data point can't be independently confirmed, mark it as unconfirmed/estimated rather than presenting it as settled fact, and attribute analyst-derived figures to the named source rather than the site's own voice.

Concrete patterns already in place — extend them the same way rather than inventing a new convention:

- **Confirmed vs. unconfirmed claims**: `data/tables/ge14_not_recontesting.json` has a `reason_confirmed: true/false` field per entry. The UI renders confirmed reasons in green (`.rt-reason-ok`) and unconfirmed ones in grey italic (`.rt-reason-unconfirmed`) — see `renderMpTable` in `results-tables.js`. Of 58 MPs who didn't recontest GE15, only 6 have a cited, confirmed reason; the rest are honestly labeled "not independently confirmed" rather than guessed at.
- **Sentiment sourcing**: every sentiment claim on the site is badged `.src-professional` (green — a named pollster with disclosed methodology: sample size, dates, sampling frame) or `.src-social` (blue — social/forum reaction, but *as reported by a news outlet*, never scraped directly — this site has no live platform API access and must never imply otherwise). See the legend on `federal.html#polling` and `about.html`'s methodology section.
- **Demographic/turnout claims**: e.g. GE15 youth turnout figures on `federal.html#who-voted` are explicitly attributed to a named political scientist's published analysis of EC data, with an explicit note that the Election Commission itself doesn't publish age/ethnicity turnout, and that ethnicity-level claims are inferred from constituency composition rather than individual ballots — a meaningfully weaker form of evidence, and the copy says so rather than blurring the distinction.

Before adding any new "fact" to this site — a statistic, a stated reason, a claim about who said what — check whether it's derivable from the CC0 ElectionData.MY dataset (`data/`) or a named, citable source. If not, either leave it out or give it the same explicit-uncertainty treatment as the examples above.

## Deploying: a successful push is not proof the site is live

GitHub Pages deploys as a separate step after the build, and it can fail independently of the commit landing — this happened for real once: a run looked entirely successful (exit 0, commit pushed) but the Pages deploy step failed during a GitHub-side outage, and nothing in the log indicated a problem.

Both automation paths poll the GitHub Actions API for the specific commit SHA's deployment conclusion before declaring success — see `.github/scripts/verify-deploy.sh`. Don't remove that step, and apply the same instinct manually: after any push, check that the SHA you pushed actually has a `success` Pages run, not just that `git push` returned 0.

## Daily automation

The canonical prompt is `.github/daily-update-prompt.txt` — read by both the GitHub Actions workflow (`.github/workflows/daily-update.yml`, scheduled 00:10 UTC / 08:10 Malaysia time, also triggerable manually via `workflow_dispatch`) and, if re-enabled, a local `launchd` job. There should only ever be one canonical copy of that prompt, tracked in this repo — don't fork a separate local-only version, or the two runners will drift apart.

The cloud workflow needs an `ANTHROPIC_API_KEY` repository secret (Settings → Secrets and variables → Actions) to run; it's billed per the Anthropic API's standard usage pricing, separate from any claude.ai subscription.

## Where to start

- [`README.md`](README.md) — what the site is, its structure, and data sources.
- [`data/SOURCES.md`](data/SOURCES.md) — full provenance and licensing for the map/results data.
- [`about.html`](about.html) — the reader-facing methodology and scope statement; if you add a page or a data source, update this too, in all four language blocks.
