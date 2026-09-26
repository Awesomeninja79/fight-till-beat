# Technical architecture

## Chosen tools and responsibilities

| Layer | Tool | Responsibility |
| --- | --- | --- |
| Language/build | TypeScript, Vite, Node LTS | Typed source, local server, deterministic static production build. Pin versions and lockfile when scaffolded. |
| UI | React | Track picker, controls, status, help, privacy, credits, fallbacks. Keep the controls in semantic HTML outside WebGL. |
| 3D | Three.js + React Three Fiber | Current arena and fighters use original procedural geometry; GLB models are a later art upgrade. R3F is a React renderer for Three.js. [R3F introduction](https://r3f.docs.pmnd.rs/getting-started/introduction). |
| Media | Browser Web Audio API | Decode/play selected WAV track, separate music/effects volume, synthesize original impacts, pause/resume, and precise clock. No audio SDK is necessary. |
| Data | Static JSON manifests | Track metadata, cue maps, asset paths, rights IDs, build schema version. |
| Local tests | Vitest | Pure timeline, cue validation, and state-transition tests. [Vitest guide](https://vitest.dev/guide/learn/writing-tests). |
| Browser tests | Playwright | Picker, transport, errors, and browser matrix. Manual audio/visual checks remain necessary. [Playwright browsers](https://playwright.dev/docs/browsers). |
| Hosting | Vercel | HTTPS static files, preview and production releases, domain, headers, rollback. |

Avoid adding state libraries, physics engines, a backend, or live beat-analysis packages unless the vertical slice reveals a concrete need. Collisions are choreographed and authored; they do not require real-time physics. Use React for menu state and a small explicit game state machine for playback/choreography.

## Runtime boundary

```text
Track picker (React/HTML) → selection → load only chosen track + cue map
Start click → AudioContext unlock → scheduled song start
Audio clock → current song position → deterministic fight state + animation pose
                                  ├→ lights and DJ pose
                                  ├→ camera and effects
                                  └→ HTML status/controls
Static assets ← same-origin CDN/Vercel
```

UI state: `menu → loading → ready → playing → paused → finished`, with `error` reachable from loading/playing and `menu` reachable from all non-loading states. Only one active audio source exists at a time. Track changes stop/dispose the previous source, scene resources, and event subscriptions. Navigation does not leave orphan audio.

## Proposed source layout

```text
src/
  app/             route shell and global styles
  ui/              picker, transport, credits, help, error screens
  game/            state machine, timeline sampler, choreography resolver
  audio/           AudioContext controller, transport, and synthesized impacts
  scene/           arena, actors, lights, camera, effects
  content/         typed manifests and cue-map loader/validator
  accessibility/   motion/flash preferences
public/
  audio/           code-generated WAV demo tracks; later cleared encoded tracks
  models/          reserved for optimized GLB art upgrade
  textures/        compressed textures when useful
  content/         versioned cue JSON
tests/             browser journeys and fixtures
```

The current music generator source is `scripts/generate-music.py`; it imports no audio samples. Future authoring sources such as `.blend`, DAW sessions, contracts, and high resolution originals must live in private or appropriately access-controlled storage. The public build receives only approved exports and required public credits. No secrets are placed in the frontend bundle.

## Configuration and failure behavior

Validate manifest/cue schema at build time and runtime. A bad track is disabled with a descriptive error; it must not crash the picker. Use a build-time generated track allowlist so a rights-affected track can be removed and redeployed without changing core logic. Catch asset load/decode failures with retry or change-track actions. WebGL context loss pauses audio and shows recovery. Browser visibility changes pause or explicitly reconcile song position according to the transport policy in [audio plan](AUDIO_AND_CHOREOGRAPHY.md).

Log only coarse, non-identifying client errors to the browser console in v1. Do not send telemetry without completing [privacy review](PRIVACY.md). Security headers and caching are specified in [deployment](DEPLOYMENT.md).
