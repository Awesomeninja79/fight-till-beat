# Product requirements

## Users and supported environment

The visitor wants to select a song and watch a stylish fight synchronized to it. Launch targets current stable desktop Chrome, Edge, Firefox, and Safari, plus current mobile Chrome and Safari on reference devices recorded in the QA report. Keyboard operation applies to all menus and transport controls. The 3D spectacle requires WebGL2; unsupported devices receive a clear fallback rather than a blank canvas. [Three.js WebGL renderer](https://threejs.org/docs/pages/WebGLRenderer.html).

## Functional requirements

| ID | Requirement | Acceptance evidence |
| --- | --- | --- |
| FR-01 | Show exactly three launch tracks with title, creator, duration, and preview. | Picker displays metadata; each preview can start/stop. |
| FR-02 | Selection precedes Start Fight; no music autoplays on page load. | Fresh page is silent; Start begins selected track and fight. |
| FR-03 | Hero fights automatically using punches, kicks, dodges, throws/launches, and a finisher. | Each track's cue sheet and capture show the planned moves. |
| FR-04 | Opponents react to contact; visual impacts align to marked beats. | Audio/video capture and cue audit show hit alignment. |
| FR-05 | Arena includes dance floor, DJ booth and animated DJ, audience silhouettes, and beat-responsive lights. | Visual review at multiple song sections. |
| FR-06 | Camera keeps hits readable and does not clip through characters. | Recorded review of each choreography sequence. |
| FR-07 | Pause, resume, restart, change track, volume, and mute work. | Browser flow tests and manual device tests. |
| FR-08 | End-of-track victory and replay/choose-track flow work. | Full playback of all three tracks. |
| FR-09 | Loading, failed audio, failed asset, WebGL loss, and unsupported browser states explain recovery. | Failure injection and UI review. |
| FR-10 | Credits, privacy, help/accessibility, and contact links are reachable from menu and fight overlay. | Keyboard and link audit. |

## Nonfunctional requirements

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
