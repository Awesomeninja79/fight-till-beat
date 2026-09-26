# Quality assurance and performance plan

## Automated checks

| Check | Tool | What it catches |
| --- | --- | --- |
| Type | TypeScript | Invalid interfaces and common code errors. A dedicated lint rule set is still pending. |
| Pure logic | Vitest | Audio position math, cue validation, state transitions, event deduplication. |
| Content | Custom validator | Missing rights IDs, assets, bad times, invalid actors/animations, unsafe light presets. |
| Browser flows | Playwright | Track selection, Start, pause/resume, restart, errors, credits/privacy links, keyboard controls. |
| Dependencies | Package manager audit + license inventory | Known vulnerabilities and license obligations. |
| Build | Vite production build | Asset paths, chunking, and bundling failures. |

Vitest is designed for Vite projects; it does not replace a separate TypeScript type check. Playwright can run Chromium, Firefox, and WebKit projects, with mobile emulation. [Vitest](https://vitest.dev/guide/learn/writing-tests), [Playwright browsers](https://playwright.dev/docs/browsers).

`.github/workflows/ci.yml` runs frozen installation, `pnpm check`, and Chromium/WebKit desktop plus mobile Chromium browser flows on `dev` and `main` pushes and pull requests. Local browser checks currently use installed Chrome; the CI browser matrix has not yet run on GitHub.

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

Each release candidate gets a short report with commit/build ID, track and asset manifest hashes, CI results, reference device matrix, performance numbers, timing captures, accessibility findings, security/header check, rights status, and any accepted limitations. The project owner reviews the report before production.
