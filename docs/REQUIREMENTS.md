# Product requirements

## Users and supported environment

The visitor wants to select a song and watch a stylish fight synchronized to it. Launch targets current stable desktop Chrome, Edge, Firefox, and Safari, plus current mobile Chrome and Safari on reference devices recorded in the QA report. Keyboard operation applies to all menus and transport controls. The 3D spectacle requires WebGL2; unsupported devices receive a clear fallback rather than a blank canvas. [Three.js WebGL renderer](https://threejs.org/docs/pages/WebGLRenderer.html).

## Functional requirements

| ID | Requirement | Acceptance evidence |
| --- | --- | --- |
| FR-01 | Show three playable originals with metadata/preview, plus explicitly unavailable requested entries. Lean On displays Major Lazer & DJ Snake feat. MØ and remains unavailable until authorized audio/cues arrive. | Playable previews work; requested entries have no playback controls or audio requests. |
| FR-02 | Selection precedes Start Fight; no music autoplays on page load. | Fresh page is silent; Start begins selected track and fight. |
| FR-03 | Hero fights automatically using punches, kicks, dodges, throws/launches, and a finisher. | Each track's cue sheet and capture show the planned moves. |
| FR-04 | Opponents react to contact; visual impacts align to marked beats. | Audio/video capture and cue audit show hit alignment. |
| FR-05 | Arena includes a dance floor, human DJ with headphones, and human audience with staggered claps, raised arms, and fist pumps. Audience freezes on pause and becomes static under Reduced Motion. | Desktop/portrait visual review, paused capture, reduced-motion review. |
| FR-06 | Anime-style cinematic shot families keep active fighters and contact readable, with continuous beat-based transitions and a fixed wide Reduced Motion option. | Desktop/portrait capture of each shot, aerial move, transition, pause, and reduced-motion setting; no clipping or obscured contact. |
| FR-07 | Pause, resume, restart, change track, volume, and mute work. | Browser flow tests and manual device tests. |
| FR-08 | End-of-track victory and replay/choose-track flow work. | Full playback of all three tracks. |
| FR-09 | Loading, failed audio, failed asset, WebGL loss, and unsupported browser states explain recovery. | Failure injection and UI review. |
| FR-10 | Credits, privacy, help/accessibility, and contact links are reachable from menu and fight overlay. | Keyboard and link audit. |
| FR-11 | Humanoid fighters use expressive anime-inspired motion: flowing guard, accelerated combinations, directed dashes, aerial kicks, recoil/launch, and turning finisher, with stylized shading/accessories and readable localized effects. | Inspect desktop/portrait poses and transitions, clip speed ramps, pause/restart stability, reduced effects, and model-load retry. Owner art approval and full-track capture remain required. |

## Nonfunctional requirements

FR-12: At least 50 uniquely identified motion profiles must be scheduled across playable songs, with a technique/discipline HUD and move book. Include boxing, kicks, judo-inspired throws, and fictional jutsu. Use continuous attack blending and limb-length-preserving IK; reserve at least 1,250 ms before the next attack after a launch/throw/finisher. Acceptance requires catalog coverage, motion tests, browser move-book checks, and owner visual review. Numerical differences alone do not establish authentic technique or polished animation.

| ID | Requirement | Gate |
| --- | --- | --- |
| NFR-01 | Audio is the sole authoritative timing clock; pause and tab changes do not cause accumulating drift. | Timing tests in [audio plan](AUDIO_AND_CHOREOGRAPHY.md). |
| NFR-02 | Safe lighting, reduced motion, keyboard focus, and readable text. | [Accessibility review](ACCESSIBILITY.md). |
| NFR-03 | No unapproved external asset or package in the release build. | [Rights register](../ASSET_REGISTER.md) and license scan. |
| NFR-04 | No accounts, tracking, advertising, uploads, or browser permission requests in v1. | [Network and storage audit](PRIVACY.md). |
| NFR-05 | Production app loads over HTTPS with security headers and no frontend secrets. | [Security review](SECURITY.md). |
| NFR-06 | Midrange mobile target of at least 30 FPS and desktop target of at least 60 FPS during typical combat; first screen at most 8 MB and selected track at most 6 MB. | Measured on named devices in [quality plan](QUALITY.md). |
| NFR-07 | Release can be rolled back and rights-affected tracks can be disabled. | [Operations rehearsal](OPERATIONS.md). |

## Explicit v1 exclusions

No manual combat, leaderboards, login, social sharing, advertising, payments, user-uploaded music, live beat detection for arbitrary songs, streaming services, server, or database. These may be future projects, not hidden dependencies of v1.
