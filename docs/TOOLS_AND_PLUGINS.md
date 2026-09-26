# Tooling and Codex integrations

## Required for this repository

| Capability | Choice | Use |
| --- | --- | --- |
| Source control | Git and public GitHub repository | `main` release branch, `dev` integration branch, pull requests, ruleset, CI. |
| App build | Node.js 24, pnpm 10, Vite, TypeScript | Frozen lockfile install and static build. |
| Game runtime | React, Three.js, React Three Fiber, Web Audio API | Browser interface, 3D arena, music clock and effects. |
| Verification | Vitest, Playwright, GitHub Actions | Cue/content checks, build, desktop and mobile browser flows. |
| Hosting | Vercel Git integration, after account setup | Preview from `dev`, production from approved merges to `main`. |

GitHub and Vercel are available as Codex connections in this workspace. The GitHub connection can inspect repositories and CI, while the Git CLI handles local commits and pushes. The operator's Vercel account is signed in and the project is connected to GitHub for protected previews. No additional Codex plugin is required for the current three-song game.

## Optional later

- A graphics tool such as Blender and a DAW can replace procedural art and synthesized demo music with professionally authored assets. Every exported asset must enter [the rights register](../ASSET_REGISTER.md).
- A security review plugin or scanner can add code and dependency review, but the release gate still requires an owner-reviewed report. Do not install a plugin merely to claim this gate passed.
- Storage, database, and search integrations become relevant only if a large licensed catalog needs an API, admin workflow, or object storage. See [catalog expansion](CATALOG_EXPANSION.md).
- An AI service is optional for content suggestions or assisted tagging. Deterministic signal processing can estimate beats and tempo; a human must review cue quality. Generating a new sound does not require an autonomous AI agent. See [audio and choreography](AUDIO_AND_CHOREOGRAPHY.md).

Do not connect a streaming music library to the playable catalog until the provider's agreement expressly permits interactive game synchronization, public distribution, worldwide territory, and any future ad use. A personal subscription or API listing is not a music license. See [rights](RIGHTS.md).
