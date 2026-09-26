# Fight Till Beat

Playable development build for a browser based 3D music-fighting experience. Three original code-generated demo tracks, a procedural disco arena, automatic choreography, controls, and browser checks are implemented locally. The [public GitHub repository](https://github.com/Awesomeninja79/fight-till-beat) has `main` as its default branch and `dev` for ongoing work. The [Vercel project](https://vercel.com/nsrathore7912-4985s-projects/fight-till-beat) is connected for protected previews, with production builds temporarily disabled. **No public game deployment exists yet; rights, privacy contact, and release review remain open.**

Run locally after `pnpm install` with `pnpm dev`. Run logic/content/build checks with `pnpm check`; run browser flows with `pnpm test:e2e`.

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
