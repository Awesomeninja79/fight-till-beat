# Fight Till Beat

Jamendo now supports 500 ms debounced search, shared track selection, Preview and Start with automatically estimated beat/fight timing. Artist/provider/license links are retained; the blanket runtime preparation restriction is removed at the owner’s request. Three originals remain the default catalog. See [Jamendo playback, setup and limits](docs/JAMENDO.md). Configuration is local; rights, release and measured timing reviews remain open.

Playable development build for a browser based 3D music-fighting experience. Three original code-generated demo tracks, a procedural disco arena, skinned humanoid fighters, anime-style skeletal combat, cinematic camera shots, automatic choreography, controls, and browser checks are implemented locally. The character upgrade uses Quaternius CC0 assets; operator release review remains pending. The [public GitHub repository](https://github.com/Awesomeninja79/fight-till-beat) has `main` as its default branch and `dev` for ongoing work. The [public game](https://project-3te70.vercel.app/) is live on Vercel, with anonymous access and basic gameplay verified. Production deployment `dpl_AVTMY3GND6iBiRs8dbrEQkbxyrX6` uses commit `3dda054`. The owner authorized this public release; rights/operator review, privacy contact, accessibility, real-device performance, and full-track timing review remain open.

Run locally after `pnpm install` with `pnpm dev`. Run logic/content/build checks with `pnpm check`; run browser flows with `pnpm test:e2e`.

Music authoring: `pnpm music:analyze <recording.wav> <track-id> <en|hi|instrumental|other> <private-draft.json>` creates a review-only beat/fight map. Optional `--beats <beats.json>` uses corrected timestamps, including tempo changes. See [content pipeline](docs/CONTENT_PIPELINE.md) for format, correction, and publishing steps. No English/Hindi recordings or provider subscriptions have been acquired.

Local music continuation adds title/artist/mood search, English/Hindi/Instrumental/Other filters, clear unavailable/empty states, and protection against overlapping preview requests. Draft fight generation now adapts rests/dodges/attacks to relative beat energy. Existing audio and authored demo cue maps are unchanged.

Latest local revision: 50 named, parameterized fighting techniques, blended recovery and two-bone limb solving; human DJ and cheering audience; a move book and technique HUD. Three original songs remain playable. The unavailable Lean On placeholder was removed at the owner’s request. The shared search now includes Jamendo metadata results.

Future project work follows the documentation upkeep rule in [AGENTS.md](AGENTS.md).

## Document map

| Question | Source of truth |
| --- | --- |
| What are we building and in what order? | [PLAN.md](PLAN.md) |
| What must the product do? | [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md) |
| How will the software be structured? | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| How will hits stay on beat? | [docs/AUDIO_AND_CHOREOGRAPHY.md](docs/AUDIO_AND_CHOREOGRAPHY.md) |
| How are music and 3D assets made? | [docs/CONTENT_PIPELINE.md](docs/CONTENT_PIPELINE.md) |
| How would a large catalog and automatic beat analysis work? | [docs/CATALOG_EXPANSION.md](docs/CATALOG_EXPANSION.md) |
| What is the fight and visual direction? | [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) |
| How are rights and credits controlled? | [docs/RIGHTS.md](docs/RIGHTS.md), [ASSET_REGISTER.md](ASSET_REGISTER.md) |
| What data is processed? | [docs/PRIVACY.md](docs/PRIVACY.md) |
| What are the security controls? | [docs/SECURITY.md](docs/SECURITY.md) |
| How will accessibility be verified? | [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) |
| How will quality and performance be tested? | [docs/QUALITY.md](docs/QUALITY.md) |
| How will the app be released and run? | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md), [docs/OPERATIONS.md](docs/OPERATIONS.md) |
| Which tools and Codex plugins are needed? | [docs/TOOLS_AND_PLUGINS.md](docs/TOOLS_AND_PLUGINS.md) |
| Which choices are unresolved? | [docs/DECISIONS.md](docs/DECISIONS.md) |

The documents describe intended controls. Checked release gates require evidence from the eventual built application; writing a plan does not count as passing a gate.
