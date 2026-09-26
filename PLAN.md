# Production plan

**Current state:** playable build, public GitHub repository, and a Vercel project connected to GitHub exist. `main` is the protected default branch, `dev` is the working branch, and GitHub Actions passed on both branches through `ad10d44`. Vercel's first `dev` deployment was labeled Production and canceled; subsequent `dev` commit `27d5048` deployed successfully as a protected Preview. The dashboard confirms no production deployment, and production builds remain skipped. Three original code-generated demo tracks, procedural 3D arena, automatic beat cues, settings, and initial tests exist. Public production remains gated. See [README.md](README.md) for current files.

## Product

Visitors choose one of three built-in songs, press **Start Fight**, and watch a stylized 3D hero automatically fight several opponents on a disco dance floor. A DJ, audience, lighting, effects, combo display, and cinematic camera respond to the music. V1 is a curated audiovisual game without manual combat, accounts, payments, multiplayer, uploads, microphone, camera, location, ads, or analytics.

## Technical baseline

Latest owner-requested scope: 50 stylized techniques spanning boxing, karate, Muay Thai, taekwondo, kung fu/Wing Chun, capoeira, judo-inspired throws, and fictional jutsu. These combine source animation with parameterized procedural motion; they are not 50 motion-capture clips or certified demonstrations. Human models replace the DJ and audience placeholders; the crowd claps and pumps fists. Lean On is listed but awaits its authorized recording. The owner reports permission; scope evidence has not been supplied. Broad library search is researched but not connected.

Vite + React + TypeScript produce a static app. Three.js and React Three Fiber render the arena. The Web Audio API supplies the authoritative song clock. Versioned JSON cue maps drive choreography and effects. The local character upgrade replaces primitive fighters with a textured, skinned Quaternius humanoid and independently cloned skeletons, colored outfits, jab/cross/reaction clips, accelerated combinations, airborne kick/finisher poses, and an anime camera/effects pass. The arena remains procedural; DJ and crowd now use the shared human rig; the three WAV tracks remain code-generated. Models and a reduced animation GLB are served locally and loaded before fight playback. Vercel is the proposed static host. Detailed responsibilities and interfaces are in [architecture](docs/ARCHITECTURE.md) and [audio/choreography](docs/AUDIO_AND_CHOREOGRAPHY.md).

Character upgrade checks: eleven logic tests, content validation, production build, and six desktop/mobile Chromium flow tests passed locally on 2026-09-26. Chrome screenshots were inspected for humanoid rendering and combat poses. Full-track timing measurements, real-device performance, visual approval, asset/operator review, accessibility, and public release gates remain open. This local change has not been deployed.

## Delivery stages

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
- No public launch until the pending business contact, rights review, privacy notice, regional review, and release evidence are complete. Operator, initial monetization posture, worldwide intent, and original music source are recorded in [decisions](docs/DECISIONS.md).

## Release authority

The project owner approves public branding, licenses, privacy text, hosting account/budget, and the final production release after reviewing a working preview and evidence. A qualified lawyer should review rights and regional privacy obligations for the chosen launch markets. Engineering verifies the application and records results in the release checklist. Planning documents alone do not establish legal clearance.


Latest verification: pnpm check passed with 19 logic tests, content validation, typecheck, and build. All 50 techniques are referenced in the playable cues, and all eight desktop/mobile Chromium flows passed, including the move book and unavailable Lean On entry. Final camera/DJ captures also verify frozen active-pose stability. See [quality](docs/QUALITY.md) for measured evidence and remaining release gates. The current work is local and has not been deployed.

Deployment requested on 2026-09-26: the current build is being published to the existing protected dev preview. This supersedes the earlier local-only status; production release gates remain open. See the deployment log for completion evidence.
