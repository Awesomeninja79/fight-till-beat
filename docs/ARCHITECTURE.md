# Technical architecture

## Chosen tools and responsibilities

| Layer | Tool | Responsibility |
| --- | --- | --- |
| Language/build | TypeScript, Vite, Node LTS | Typed source, local server, deterministic static production build. Pin versions and lockfile when scaffolded. |
| UI | React | Track picker, controls, status, help, privacy, credits, fallbacks. Keep the controls in semantic HTML outside WebGL. |
| 3D | Three.js + React Three Fiber | Procedural venue plus GLTFLoader-loaded humanoid fighters. SkeletonUtils clones each actor; AnimationMixer samples skeletal clips from the audio clock. R3F is a React renderer for Three.js. [R3F introduction](https://r3f.docs.pmnd.rs/getting-started/introduction). |
| Media | Browser Web Audio API | Decode/play selected WAV track, separate music/effects volume, synthesize original impacts, pause/resume, and precise clock. No audio SDK is necessary. |
| Data | Static JSON manifests | Track metadata, cue maps, asset paths, rights IDs, build schema version. |
| Local tests | Vitest | Pure timeline, cue validation, and state-transition tests. [Vitest guide](https://vitest.dev/guide/learn/writing-tests). |
| Browser tests | Playwright | Picker, transport, errors, and browser matrix. Manual audio/visual checks remain necessary. [Playwright browsers](https://playwright.dev/docs/browsers). |
| Hosting | Vercel | HTTPS static files, preview and production releases, domain, headers, rollback. |

Avoid adding state libraries, physics engines, a backend, or live beat-analysis packages unless the vertical slice reveals a concrete need. Collisions are choreographed and authored; they do not require real-time physics. Use React for menu state and a small explicit game state machine for playback/choreography.

## Runtime boundary

Music authoring now has a separate offline Node boundary: private PCM WAV → chunk-aware decoding/energy analysis → candidate beats or corrected timestamp input → hash-bound draft cues → human timing/rights approval → catalog validation → normal static release. No package or runtime network destination was added. The content validator imports `scripts/music-pipeline.mjs` to check exact audio hashes and review/language metadata on new tracks. It permits catalog growth beyond the three original demos. Runtime playback still samples the existing cue schema from the Web Audio clock.

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
  models/          versioned skinned humanoid and reduced combat animation GLBs
  textures/        compressed textures when useful
  content/         versioned cue JSON
tests/             browser journeys and fixtures
```

The current music generator source is `scripts/generate-music.py`; it imports no audio samples. Future authoring sources such as `.blend`, DAW sessions, contracts, and high resolution originals must live in private or appropriately access-controlled storage. The public build receives only approved exports and required public credits. No secrets are placed in the frontend bundle.

## Configuration and failure behavior

Local discovery uses `src/game/catalog.ts` for Unicode-normalized word matching and language filtering. Search state stays in React memory. The App prevents launching a selection outside the visible results and tracks transport request generations; AudioEngine independently cancels stale asynchronous starts. The original three manifest entries now declare `instrumental`, and the requested Lean On entry declares `en`. No backend or external music network call was added.

Validate manifest/cue schema at build time and runtime. A bad track is disabled with a descriptive error; it must not crash the picker. Use a build-time generated track allowlist so a rights-affected track can be removed and redeployed without changing core logic. Catch asset load/decode failures with retry or change-track actions. WebGL context loss pauses audio and shows recovery. Browser visibility changes pause or explicitly reconcile song position according to the transport policy in [audio plan](AUDIO_AND_CHOREOGRAPHY.md).

Log only coarse, non-identifying client errors to the browser console in v1. Do not send telemetry without completing [privacy review](PRIVACY.md). Security headers and caching are specified in [deployment](DEPLOYMENT.md).

## Character runtime

`scene/fighterAssets.ts` caches one model and two animation-library requests, starts preloading from the menu, and clears the pending promise on failure so Start can retry. Start awaits both these assets and the selected cue map before audio playback. Assets are embedded GLBs fetched from the same origin; there is no runtime third-party asset host. `scene/Fighter.tsx` owns independent cloned skeletons, per-actor materials, and mixers, while geometry/textures are shared. Cleanup stops/uncaches animations and disposes cloned materials; effect setup rebinds actions after React StrictMode cleanup. A bind-space clothing shader follows skin deformation. Animation translation preserves target limb lengths and offsets only the pelvis; rotation tracks share the compatible named humanoid rig. `game/combat.ts` reconstructs movement and attack windows from song time.

Anime direction adds `game/cinematography.ts`, a pure time/aspect/settings-to-shot sampler, and `scene/CombatEffects.tsx`, bounded instanced impact shards and dash strokes plus slash arcs. `scene/animeCostume.ts` creates head-attached hair and a spine-attached segmented scarf; these accessory geometries/materials are actor-owned and disposed on cleanup. The body shader quantizes part of the lighting and adds a colored rim. Camera state is assigned from the sampler each frame, so pause/seek does not depend on frame-rate smoothing. No postprocessing package, external asset, service, or new runtime network destination was added.

## Current technique and venue extension
One cached model and two libraries (`combat-v1.glb`, `melee-v2.glb`) load before playback. `game/techniques.json` supplies 50 motion profiles to runtime, tests, and `scripts/choreograph.mjs`. Events reference technique IDs. `martialArts.ts` applies time-authored trajectories and analytic two-bone IK over source clips; overlapping attacks share normalized weights. Bone rotations/positions are restored before additive work. `VenuePeople.tsx` clones the human mesh for a headphone-wearing DJ and 14/8 audience members at High/Low. Geometry/textures are shared; materials/accessories/mixers are actor-owned. Venue motion follows song time and pauses deterministically. No new runtime network destination was introduced.
Catalog entries form a playable/requested union. `audio-required` entries have no audio/cue URL and cannot be selected or previewed. Initial playback selection filters to playable tracks.
