# Quality assurance and performance plan

## Automated checks

### Offline music expansion evidence, 2026-09-26

`pnpm check` passed for this local change: typecheck, 19 existing Vitest tests, seven Node pipeline tests, content validation (three originals and one requested entry), and production build. New tests cover known 120 BPM clicks, opposite-phase stereo, silent/truncated input, invalid corrections, variable-tempo timestamps and recovery intervals, human-review/hash/language requirements, analysis of all three actual original recordings, WAV metadata chunks, and CLI no-overwrite/public-output protection. The initial recording integration assertion exposed manifest rounding to two decimals; it now uses a 5 ms tolerance for that legacy metadata only. Audio hash comparison remains exact.

The production JS/CSS artifact names and sizes match the preceding build: runtime UI/playback code and shipped audio/cues were not changed. Browser flows were not rerun for this offline-tool change. No actual English/Hindi vocal recording, third-party provider, full-track beat accuracy, human musical phrasing, or audible contact timing was validated. The existing large-JS-chunk warning remains. This work has not been deployed.

FR-13 release gates: audition and correct every imported song, record real review approval against its exact hash, verify licensed scopes and credits, test normal/reduced-effects playback and pause/resume, and capture full-song audible synchronization on target devices. Current PCM publication limits remain 32 kHz / 6 MB; compressed/full-length song support requires further work. Existing rights, privacy/contact, accessibility, and real-device performance gates remain open.

| Check | Tool | What it catches |
| --- | --- | --- |
| Type | TypeScript | Invalid interfaces and common code errors. A dedicated lint rule set is still pending. |
| Pure logic | Vitest | Audio position math, cue validation, state transitions, event deduplication. |
| Content | Custom validator | Missing rights IDs, assets, bad times, invalid actors/animations, unsafe light presets. |
| Browser flows | Playwright | Track selection, Start, pause/resume, restart, errors, credits/privacy links, keyboard controls. |
| Dependencies | Package manager audit + license inventory | Known vulnerabilities and license obligations. |
| Build | Vite production build | Asset paths, chunking, and bundling failures. |

Vitest is designed for Vite projects; it does not replace a separate TypeScript type check. Playwright can run Chromium, Firefox, and WebKit projects, with mobile emulation. [Vitest](https://vitest.dev/guide/learn/writing-tests), [Playwright browsers](https://playwright.dev/docs/browsers).

`.github/workflows/ci.yml` runs frozen installation, `pnpm check`, and Chromium/WebKit desktop plus mobile Chromium browser flows on `dev` and `main` pushes and pull requests. CI runs the Playwright projects with one worker because concurrent GPU-backed browser sessions closed Chromium on the Linux runner even though the same catalog flow passed locally; retries remain a diagnostic fallback, not a substitute for a clean run. The initial `main` and `dev` runs at commit `4db7840` passed on GitHub. Local browser checks use installed Chrome; the current catalog, transport, accessibility, missing-audio, and model-retry flows pass on desktop and mobile Chromium. These results do not replace the manual timing, device, accessibility, or release reviews below.

## Manual checks that automation cannot replace

- Play every entire track on actual desktop Chrome/Edge/Firefox/Safari and actual mobile Chrome/Safari reference devices; record OS/browser/device versions at release.
- Capture audio and video at intro, transition, chorus, finisher, and after a pause/resume; measure contact to cue error. Aim for median visible impact error within 50 ms and no accumulated drift across a full song. If this target proves unrealistic on a reference device, record the reason and adjust the design before release.
- Inspect character readability, camera occlusion, clipping, broken rigs, DJ visibility, UI text, effect intensity, safe flash behavior, and reduced motion.
- Simulate slow download, offline transition, bad asset URL, audio decode failure, hidden tab, sleep/wake, lost WebGL context, and a supported-browser fallback.
- Run keyboard and screen-reader checks on HTML UI, inspect contrast/zoom, and review the network and storage panels for unexpected data processing.

## Performance budget

Initial targets: menu interactive within 5 seconds on a measured midrange mobile connection; typical combat at 30 FPS or more on reference mobile and 60 FPS or more on reference desktop; first-screen transfer at most 8 MB; selected song at most 6 MB. Record hardware, browser, network throttle, actual transfer, FPS distribution, and memory behavior. These are measurable project targets, not promises for every device.

Optimization levers: selected-track-only fetch, compressed assets, smaller textures, mesh instancing for crowd, bounded particles, fewer dynamic lights and shadows, capped device pixel ratio, quality presets. Test the Low preset on mobile before reducing artistic quality globally.

## Release evidence

### Local character upgrade, 2026-09-26

The initial humanoid pass passed typecheck, seven Vitest cases, content validation, build, and six desktop/mobile Chromium flows. StrictMode mixer cleanup initially caused a bind pose and was corrected by rebinding actions on effect setup. A regression test samples 120 frozen frames plus a backward seek to verify additive kicks cannot accumulate bone rotation. The two model files total 7,579,236 bytes before HTTP compression; first-screen transfer and real-device FPS must be measured, not inferred from these sizes.

The anime follow-up passed `pnpm check`: eleven Vitest cases, typecheck, three-track content validation, and build. Added tests cover contact-time holds, deterministic camera reconstruction, fixed reduced-motion shots, and finite camera bounds across landscape/portrait timelines. Installed Chrome captures show stylized fighters, close/elevated/low shots, hair/scarf, and impact effects with no page or shader errors observed. Browser regression results for the final pass are recorded below. Vite still reports a large JS chunk (about 1.22 MB uncompressed / 336 KB gzip).

Additional anime release checks: inspect every shot family on every target; verify hero/opponent framing through knockback and aerial recovery; audition added swooshes and denser hit sequences; inspect costume deformation and scarf occlusion; test fixed Reduced Motion framing and Reduced Flash effects; capture the full track for timing and flash analysis. Synthetic source-clock captures show poses, not measured synchronization to audible output.

Final browser evidence: the four accessibility/model-retry flows passed on desktop/mobile Chromium. Both extended transport flows then passed against the visible port-5174 preview, including byte-identical screenshots taken 250 ms apart while paused. Their initial 30-second test budget expired during GPU capture; `test.slow()` gives these two screenshot-heavy cases a 90-second budget without changing individual transport assertion deadlines. The successful desktop/mobile runs took 33.9/36.7 seconds. Set `PLAYWRIGHT_PORT=5174` to check that preview; the default remains 5173 and server startup now uses `--strictPort` to avoid silently selecting another port. These are regression results, not FPS evidence.

FR-11 release review must cover all move kinds on all songs, opponent separation and foot sliding, contact error, pause/restart pose stability, missing/corrupt GLBs, normal/reduced motion, portrait framing, and rights approval. Actual phone performance, Safari/WebKit for this revision, full-track audio/video timing, accessibility review, distinct character designs, and owner visual acceptance remain open.

Each release candidate gets a short report with commit/build ID, track and asset manifest hashes, CI results, reference device matrix, performance numbers, timing captures, accessibility findings, security/header check, rights status, and any accepted limitations. The project owner reviews the report before production.

## Current 50-technique and human-venue verification
Final pnpm check passed: typecheck, 19 Vitest tests, content validation, and production build. The final repertoire has 50 unique motion profiles and all are scheduled across the three playable cue maps. Tests exercise real shipped skeleton transforms for every technique at anticipation/contact/recovery samples, repeated frozen poses, limb-length-preserving IK, blend continuity, heavy-move cooldown, and throw framing. The most recent completed browser suite passed all 8 desktop/mobile Chromium flows: transport plus 50-entry move book, paused canvas equality, accessibility controls, missing-audio Lean On entry, and failed model retry. Following camera/DJ refinements, source-clock Chrome captures covered desktop/mobile throw framing and the human DJ, with byte-identical active-throw/DJ frames 250 ms apart and no page errors observed. This is deterministic pose evidence, not measured audible synchronization.
Three GLBs total 8,356,276 bytes before HTTP compression; the first-screen 8 MB transfer gate and real-device FPS remain unverified. The JS bundle remains about 1.24 MB raw / 342 KB gzip with Vite's large-chunk warning. Human crowd counts are bounded at 14/8 for High/Low. Performance optimization, actual-device testing, all-song audiovisual timing, authentic contact/grappling polish, distinct faces, owner visual acceptance, rights/operator approval, accessibility and privacy/contact release gates remain open. No public deployment was performed.

Deployment verification, 2026-09-26: Vercel reports successful Preview deployment of 3dda054. The stable preview alias returns HTTP 302 to Vercel SSO and no-store. Remote pnpm check passed. Authenticated deployed browser/playback checks remain unverified due connector team-access denial and browser-tool initialization failure; local captures do not substitute for that gate.

Public-release follow-up, 2026-09-26: GitHub Actions run `36241892802` for commit `3dda054` is **completed/success**, confirming the configured remote verification workflow passed. No additional runtime tests were run for this documentation-only follow-up. Public deployment and anonymous deployed playback checks await Vercel team access. Previously listed manual/device/review gates remain open.

Production smoke result: https://project-3te70.vercel.app/ returned anonymous HTTP 200. Headless installed Chrome completed menu -> Neon Strike arena -> 50 techniques -> intermission -> tracklist with zero page errors and zero failed app responses. Production identity is READY `dpl_AVTMY3GND6iBiRs8dbrEQkbxyrX6`, source `3dda054`. This supersedes the pending-access notes. Full-track timing, actual-device performance and manual review gates remain open.
