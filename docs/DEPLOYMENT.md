# Hosting and deployment plan

## Hosting decision

Vercel serves the static Vite build over HTTPS. V1 needs no server functions or database. The Vercel Codex connection is already installed, so no additional Codex plugin is required. A Git repository connected to Vercel can produce preview deployments; a manual CLI deployment is also possible. [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [deployment methods](https://vercel.com/docs/deployments/overview).

Vercel Hobby is restricted to personal, noncommercial use. A commercial or paid production requires Pro or Enterprise. Confirm the owner's account plan, current terms, anticipated traffic and media transfer costs before launch. The signed-in Vercel team currently shows Hobby. Hobby's Standard Protection does not protect the production domain, so production cannot serve as a private review environment. The owner explicitly authorized public production on 2026-09-26; the earlier preview-only direction is superseded. Outstanding review gates remain recorded separately. [Vercel fair use](https://vercel.com/docs/limits/fair-use-guidelines), [deployment protection](https://vercel.com/docs/deployment-protection).

## Environments

| Environment | Purpose | Access |
| --- | --- | --- |
| Local | Development with original or cleared test assets | Developer machine |
| Preview | Full release-candidate testing | Protected Vercel preview; limited reviewers |
| Production | Public game and domain | Public HTTPS |

Git branch policy: `main` is the GitHub default and intended Vercel production branch. `dev` is the integration/development branch and receives preview deployments. Feature work branches from `dev` and merges back to `dev` after checks; a reviewed release merges `dev` into `main`. The public repository is [Awesomeninja79/fight-till-beat](https://github.com/Awesomeninja79/fight-till-beat). GitHub ruleset `Protect main releases` is active for the default branch: pull requests and the `verify` GitHub Actions check are required, force pushes and deletion are blocked. GitHub Actions passed through `dev` commit `ad10d44`; later runs should be checked separately.

The [Vercel project](https://vercel.com/nsrathore7912-4985s-projects/fight-till-beat) was created empty, renamed, and connected to this GitHub repository. It uses Node.js 24, Vite, and Vercel Authentication with Standard Protection for previews. Production environment Branch Tracking displays `main`. Before Git connection, Ignored Build Step was **Only build pre-production**. The first Git-triggered deployment nonetheless showed Environment **Production**, Source `dev`, commit `0540558`; it was canceled before becoming ready. Vercel states that a new project's first deployment is marked production. The following `dev` documentation push (`ad10d44`) occurred with Ignored Build Step **Don't build anything** (`exit 0`). Ignored Build Step was restored to **Only build pre-production**. Commit `27d5048` became a **Ready** Preview deployment, [5GCha3UXP](https://vercel.com/nsrathore7912-4985s-projects/fight-till-beat/5GCha3UXPHxkruE5tpEAn36NCKLG); the dashboard still reported **No Production Deployment**. An unauthenticated request to the preview URL returned HTTP 302 to Vercel SSO, with `no-store` and `noindex`. A signed-in browser loaded the song picker and started Neon Strike in the 3D arena with no browser console errors. This verifies the preview pipeline and basic deployed flow, but does not complete release QA. [Vercel first deployment behavior](https://vercel.com/docs/domains/working-with-domains/deploying-and-redirecting), [Git branch environments](https://vercel.com/docs/git).

The branch preview URL is [fight-till-beat-git-dev-nsrathore7912-4985s-projects.vercel.app](https://fight-till-beat-git-dev-nsrathore7912-4985s-projects.vercel.app/). Ignored Build Step was switched to **Automatic** for the owner-authorized public release on 2026-09-26. Future reviewed releases should merge through protected `main`; its builds are no longer intentionally skipped. The first public release promoted the tested `dev` commit.

Keep rights evidence and masters outside every environment's public output. Use a separate approved export manifest for each deployment. Do not put secrets in `VITE_*` variables or static files.

## Release procedure

1. Create the public Git repository with `main` as default and `dev` for integration. The committed lockfile and `.github/workflows/ci.yml` run typecheck, unit/content tests, build, and browser flows. Lint remains a follow-up; do not claim it is a passing gate.
2. Confirm the connected Vercel project has `main` as production branch, `dev` as preview, Vercel Authentication on for previews, and the preview-only build gate on after the first-deployment check. `vercel.json` fixes the Vite build/output settings and basic security headers. A restrictive CSP needs browser testing before being enabled. Configure billing/usage alerts. [Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json), [preview protection](https://vercel.com/docs/deployment-protection).
3. Build and deploy a preview from the release commit. Confirm every asset response, cache behavior, MIME type, CSP/header behavior, browser console, actual network destinations, and the user journeys.
4. Obtain the quality report and rights/privacy/security sign-offs. Promote the tested artifact or deploy that exact commit to production. Vercel supports preview and production workflows. [Deployments](https://vercel.com/docs/deployments/overview).
5. Run production smoke tests: open menu, preview each song, complete one full fight, confirm remaining tracks load, credits/privacy pages work, and no unexpected asset errors occur.
6. Record deployment URL, commit, timestamp, plan, release manifest, and known-good rollback target in the release log.

## CDN and media handling

Fingerprinted immutable audio/GLB/texture assets can have long cache lifetimes; HTML/manifest updates must not point to missing or stale versions. Avoid caching private originals. If licensing requires immediate withdrawal, use versioned catalogs and a tested disable/replace mechanism; account for CDN cache propagation and contract terms. A larger catalog may move audio to authorized object storage/CDN and introduce catalog APIs as specified in [catalog expansion](CATALOG_EXPANSION.md).

## Rollback

Keep the prior successful deployment. On a bad release, roll back the production alias, then verify the public URL and media files. For a rights issue, rollback alone may not remove a historically deployed asset; unpublish the catalog entry, remove/restrict the media object where possible, and review retained deployments/cache with the provider. Rehearse both paths before launch.

## 2026-09-26 combat upgrade preview
Owner requested deployment of the current build. Publish the tested humanoid/50-technique/cheering-crowd changes through `dev` to the existing protected preview. Three original tracks are playable; Lean On remains an audio-required metadata entry. No music provider is connected. Local evidence: `pnpm check` passed with 19 logic tests plus type/content/build checks; eight desktop/mobile browser flows passed, followed by corrected throw-framing and frozen-pose captures. Production settings and public release gates remain unchanged.
The Vercel connector currently lacks access to this team; the authenticated Git credential helper is available, so Git-triggered deployment is the selected route. Record the resulting commit, deployment status and deployed checks after the push. Previous source baseline: `b9c9bae`; the existing protected preview remains the rollback reference until the new deployment succeeds.

Deployment result: commit `3dda054be0efec7cf57161110ebe9a42b1827781` pushed to `dev`. GitHub deployment `6678792312` reports environment **Preview**, state **success**, description **Deployment has completed**. Immutable URL: https://fight-till-beat-2p1n39ewf-nsrathore7912-4985s-projects.vercel.app . Vercel dashboard: https://vercel.com/nsrathore7912-4985s-projects/fight-till-beat/82BGifn2qJu7c4uwCk28qEDk2qv5 . The stable dev alias returned HTTP 302 to Vercel SSO with `Cache-Control: no-store, max-age=0`; protection remains enabled. No production promotion was performed.
Remote CI run: https://github.com/Awesomeninja79/fight-till-beat/actions/runs/36241892802 . Dependency install and pnpm check passed; browser-suite completion is recorded in the subsequent verification note. Protected-page smoke testing could not be performed through the current connector: its account has no access to the project team. The browser automation tool also failed to initialize because of the Windows sandbox helper. These access/tool limitations do not change the provider's successful deployment result; signed-in deployed playback/asset checks remain outstanding.

Final handoff verification note: remote CI was still in progress at handoff; pnpm check had passed and the browser suite had not reported a final result. Do not treat the successful Vercel preview deployment as a completed cross-browser or authenticated deployed-smoke gate.

## 2026-09-26 public promotion request
The owner explicitly requested making the website live. Promote the successful `3dda054` artifact to production using the existing Vercel project. Remote CI run `36241892802` has now completed with **success**. Current access blocker: the Vercel connector is not authorized for team `team_ALYAUhIvzZd7WXRk135be3iJ`; no standard local CLI login file exists, and the browser automation runtime fails to initialize. Owner reconnection to the correct Vercel account/team is requested. Public promotion has not been performed or verified. Keep preview protection in place. After access is restored, promote the exact artifact, record the assigned production domain, verify anonymous HTTP/asset access and gameplay, and reconcile future production build settings with the protected-main release workflow. Rights/privacy/accessibility/performance reviews remain open.

Access retry: owner reconnected the Vercel plugin, but listing the owning team's projects still returned HTTP 403. The official Vercel CLI login is now awaiting owner browser authorization; no token or login code is stored in project documents. No production change has been made.

## Public release completed: 2026-09-26
- Public domain: https://project-3te70.vercel.app/ (anonymous HTTP 200, no SSO redirect). The long team/deployment aliases remain protected; share the public domain.
- Production deployment: `dpl_AVTMY3GND6iBiRs8dbrEQkbxyrX6`, **READY**, source `3dda054be0efec7cf57161110ebe9a42b1827781`, created 18:42:15 Asia/Kolkata. Dashboard: https://vercel.com/nsrathore7912-4985s-projects/fight-till-beat/AVTMY3GND6iBiRs8dbrEQkbxyrX6 .
- Access: official CLI device login succeeded after the connector remained unauthorized. Local `.vercel/` and `.env*` files are ignored and must not be committed. No credential is included in this release record.
- First promotion created canceled production `dpl_Ey2rLKQ9zT2UdPd6rzkCNXGXcSpR` because the old ignore command skipped production. Setting `commandForIgnoringBuildStep` to null enabled Automatic builds. The retry rebuilt the exact source commit and became ready. Preview authentication was retained.
- Verification: remote CI run `36241892802` succeeded; anonymous Chrome loaded the menu, started Neon Strike, opened all 50 techniques, paused and returned to the tracklist without page errors or failed app responses. Screenshot: local ignored `test-results/production-smoke.png`. This is a basic smoke test, not full-track timing or device-performance approval.
- First public release has no previous production rollback target. Preserve this successful deployment as the baseline; the protected `3dda054` preview remains available. Rollback/withdrawal rehearsal, support contact, rights/operator review, privacy/accessibility and performance reviews remain open. No paid services or domains were purchased.
