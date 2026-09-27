# Production plan

Current delivery update (2026-09-27): Jamendo Preview and Start now load provider audio and generate automatic fight cues in memory. The owner requested removal of the blanket runtime license/preparation gate. Shared selection, cancellation, pause/resume, replay, credits and direct-media privacy disclosure are implemented; deployment, rights and measured audible timing reviews remain open. This supersedes earlier discovery-only status. Verification: 38 unit/pipeline tests, final build, focused desktop/mobile transport and retry checks, and a real Jamendo recording playing with generated attacks; see docs/QUALITY.md for scope and earlier failures.

Current music UI: one search/filter and shared selectable card layout across originals and Jamendo, with no source tabs. Default view remains three originals. Provider playback now generates session fight maps automatically; publication/use reviews remain open.

Current music direction, 2026-09-27: owner selected Jamendo and supplied an application Client ID. A server-mediated discovery view now supports 500 ms debounce, stale-request cancellation, in-flight deduplication, language filtering and pagination. Owner also requested removal of the unavailable Lean On listing; only the three originals remain in the game manifest. The earlier no-provider and requested-Lean-On descriptions are historical. Song rights, API commercial agreement, cloud configuration, provider quota/abuse controls and production verification remain open. See [Jamendo](docs/JAMENDO.md).

**Current state:** [The game is live](https://project-3te70.vercel.app/) on Vercel production, deployment `dpl_AVTMY3GND6iBiRs8dbrEQkbxyrX6`, source commit `3dda054`. Remote CI passed. Anonymous HTTP access, game start, 50-entry technique book, pause, and return to the tracklist passed with no browser errors. `main` remains the protected default branch; this first public release was promoted from the tested `dev` preview. Automatic builds are enabled. Manual rights/privacy/accessibility/performance and full-track timing reviews remain open; owner authorization does not mark them passed. See [README.md](README.md) for current files.

## Product

Visitors choose one of three built-in songs, press **Start Fight**, and watch a stylized 3D hero automatically fight several opponents on a disco dance floor. A DJ, audience, lighting, effects, combo display, and cinematic camera respond to the music. V1 is a curated audiovisual game without manual combat, accounts, payments, multiplayer, uploads, microphone, camera, location, ads, or analytics.

## Technical baseline

Latest owner-requested scope: 50 stylized techniques spanning boxing, karate, Muay Thai, taekwondo, kung fu/Wing Chun, capoeira, judo-inspired throws, and fictional jutsu. These combine source animation with parameterized procedural motion; they are not 50 motion-capture clips or certified demonstrations. Human models replace the DJ and audience placeholders; the crowd claps and pumps fists. The Lean On placeholder was removed at owner request; historical permission evidence remains unresolved. Jamendo metadata search is connected locally.

Vite + React + TypeScript produce a static app. Three.js and React Three Fiber render the arena. The Web Audio API supplies the authoritative song clock. Versioned JSON cue maps drive choreography and effects. The local character upgrade replaces primitive fighters with a textured, skinned Quaternius humanoid and independently cloned skeletons, colored outfits, jab/cross/reaction clips, accelerated combinations, airborne kick/finisher poses, and an anime camera/effects pass. The arena remains procedural; DJ and crowd now use the shared human rig; the three WAV tracks remain code-generated. Models and a reduced animation GLB are served locally and loaded before fight playback. Vercel is the proposed static host. Detailed responsibilities and interfaces are in [architecture](docs/ARCHITECTURE.md) and [audio/choreography](docs/AUDIO_AND_CHOREOGRAPHY.md).

Character upgrade checks: eleven logic tests, content validation, production build, and six desktop/mobile Chromium flow tests passed locally on 2026-09-26. Chrome screenshots were inspected for humanoid rendering and combat poses. Full-track timing measurements, real-device performance, visual approval, asset/operator review, accessibility, and public release gates remain open. This local change has not been deployed.

## Delivery stages

Music continuation: local catalog search and language filters, accurate playable counts, filtered selection handling, stale-preview cancellation, and energy-aware draft choreography are implemented. Three instrumental originals remain playable. The Lean On placeholder is removed. Jamendo is selected for discovery; recording permissions and human timing review remain unresolved. No new production recording or asset credit is introduced, and no deployment is included.

Resumed music verification, 2026-09-27, on `6696d2f`: `pnpm check` passed (21 Vitest plus eight pipeline tests, content validation, typecheck/build). Focused catalog flows passed on desktop/mobile Chromium; mobile layout was inspected. See [quality](docs/QUALITY.md) for evidence scope. No additional songs or release approvals are implied by these checks.

Music expansion, 2026-09-26: owner approved a small cleared English/Hindi catalog with offline beat analysis and human correction. The local `music:analyze` command now produces hash-bound draft cues from WAV recordings, with language metadata and correction-file support. New catalog IDs require timing/rights review metadata and exact audio hashes at content validation. The existing three originals remain playable; no additional recording, music provider, or new deployment is included. Automatic analysis is a steady-tempo proposal, not verified support for every song. Provider/budget, actual recordings, permissions, full-song corrections, and measured synchronization remain open.

Music pipeline verification: `pnpm check` passed with 19 existing logic tests, seven offline pipeline tests, typecheck, content validation, and build. No browser test rerun or deployment for this offline authoring change; see [quality](docs/QUALITY.md) for scope and remaining gates.

| Stage | Output | Gate |
| --- | --- | --- |
| 0. Decisions and rights | Operator, launch markets, style, target devices, first cleared song, rights register | First track and core assets have documented permitted use. |
| 1. Foundation | App shell, track picker, loading/error states, Web Audio clock, cue validator | Implemented locally; timing review remains. |
| 2. Vertical slice | One finished arena, hero, enemy, DJ, 60–120 second song | Playable local build; art, audio, accessibility, and performance review remain. |
| 3. Content | Three cleared tracks, distinct cue maps, three enemy variants, credits | Every shipped asset has a rights record; no placeholders remain. |
| 4. Release candidate | CI, tests, privacy/help/credits pages, protected preview | All gates in the quality, rights, privacy, security, and accessibility documents pass. |
| 5. Production | Domain, Vercel production deployment, runbook | Public smoke test passes; monitoring and rollback are ready. |

## Production rules

- Asset rights must be resolved before an asset enters the release build. Music composition and recording rights are separate; no commercial song is assumed cleared. See [rights](docs/RIGHTS.md).
- No user-level analytics, advertising, or third-party scripts at initial launch. The hosting provider still processes request metadata; the notice must describe the observed data flow. See [privacy](docs/PRIVACY.md).
- Light effects are safe by default, with reduced flash and motion options. See [accessibility](docs/ACCESSIBILITY.md).
- Any new accounts, uploads, user-selected music, social features, payments, or ads trigger a new architecture, rights, privacy, and security review.
- The owner explicitly authorized making the current build public on 2026-09-26. Pending business contact, rights review, privacy notice, regional review, and release evidence remain unresolved; deployment authorization does not mark them complete. Operator, initial monetization posture, worldwide intent, and original music source are recorded in [decisions](docs/DECISIONS.md).

## Release authority

The project owner approves public branding, licenses, privacy text, hosting account/budget, and the final production release after reviewing a working preview and evidence. A qualified lawyer should review rights and regional privacy obligations for the chosen launch markets. Engineering verifies the application and records results in the release checklist. Planning documents alone do not establish legal clearance.


Latest verification: pnpm check passed with 19 logic tests, content validation, typecheck, and build. All 50 techniques are referenced in the playable cues, and all eight desktop/mobile Chromium flows passed, including the move book and unavailable Lean On entry. Final camera/DJ captures also verify frozen active-pose stability. See [quality](docs/QUALITY.md) for measured evidence and remaining release gates. The current work is local and has not been deployed.

Deployment requested on 2026-09-26: the current build is being published to the existing protected dev preview. This supersedes the earlier local-only status; production release gates remain open. See the deployment log for completion evidence.

Preview deployment completed for commit 3dda054: https://fight-till-beat-2p1n39ewf-nsrathore7912-4985s-projects.vercel.app . Vercel reports Preview/success and sign-in protection was verified. Public production was not enabled. Authenticated deployed-game smoke testing remains open because the current connector lacks project-team access.

Public release follow-up: owner requested making the site live. CI run `36241892802` for `3dda054` completed successfully. Promotion is blocked by access to the owning Vercel team; reconnection requested. The existing preview remains protected until production promotion and anonymous smoke testing are verified.

Public release completed on 2026-09-26 after direct Vercel CLI login restored team access. See [deployment](docs/DEPLOYMENT.md) for the live domain, exact build identity and verification evidence. Earlier pending-access notes above are historical.
