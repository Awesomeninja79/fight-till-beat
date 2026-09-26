# Hosting and deployment plan

## Hosting decision

Vercel serves the static Vite build over HTTPS. V1 needs no server functions or database. The Vercel Codex connection is already installed, so no additional Codex plugin is required. A Git repository connected to Vercel can produce preview deployments; a manual CLI deployment is also possible. [Vite on Vercel](https://vercel.com/docs/frameworks/frontend/vite), [deployment methods](https://vercel.com/docs/deployments/overview).

Vercel Hobby is restricted to personal, noncommercial use. A commercial or paid production requires Pro or Enterprise. Confirm the owner's account plan, current terms, anticipated traffic and media transfer costs before launch. [Vercel fair use](https://vercel.com/docs/limits/fair-use-guidelines).

## Environments

| Environment | Purpose | Access |
| --- | --- | --- |
| Local | Development with original or cleared test assets | Developer machine |
| Preview | Full release-candidate testing | Protected Vercel preview; limited reviewers |
| Production | Public game and domain | Public HTTPS |

Git branch policy: `main` is the GitHub default and intended Vercel production branch. `dev` is the integration/development branch and will receive preview deployments after Vercel connection. Feature work branches from `dev` and merges back to `dev` after checks; a reviewed release merges `dev` into `main`. The public repository is [Awesomeninja79/fight-till-beat](https://github.com/Awesomeninja79/fight-till-beat). GitHub ruleset `Protect main releases` is active for the default branch: pull requests and the `verify` GitHub Actions check are required, force pushes and deletion are blocked. The initial CI runs passed on both `main` and `dev` at commit `4db7840`. Vercel has not yet been connected, so a push to `main` does **not yet** trigger deployment. Once the Git integration is set up, a release merge to `main` will trigger production deployment. Public production remains blocked until rights, privacy/contact, and release checks pass.

Keep rights evidence and masters outside every environment's public output. Use a separate approved export manifest for each deployment. Do not put secrets in `VITE_*` variables or static files.

## Release procedure

1. Create the public Git repository with `main` as default and `dev` for integration. The committed lockfile and `.github/workflows/ci.yml` run typecheck, unit/content tests, build, and browser flows. Lint remains a follow-up; do not claim it is a passing gate.
2. Connect the GitHub repository to Vercel with `main` as production branch and `dev` as preview branch. `vercel.json` fixes the Vite build/output settings and basic security headers. A restrictive CSP needs browser testing before being enabled. Configure preview protection, team roles, and billing/usage alerts. [Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json), [preview protection](https://vercel.com/docs/deployment-protection).
3. Build and deploy a preview from the release commit. Confirm every asset response, cache behavior, MIME type, CSP/header behavior, browser console, actual network destinations, and the user journeys.
4. Obtain the quality report and rights/privacy/security sign-offs. Promote the tested artifact or deploy that exact commit to production. Vercel supports preview and production workflows. [Deployments](https://vercel.com/docs/deployments/overview).
5. Run production smoke tests: open menu, preview each song, complete one full fight, confirm remaining tracks load, credits/privacy pages work, and no unexpected asset errors occur.
6. Record deployment URL, commit, timestamp, plan, release manifest, and known-good rollback target in the release log.

## CDN and media handling

Fingerprinted immutable audio/GLB/texture assets can have long cache lifetimes; HTML/manifest updates must not point to missing or stale versions. Avoid caching private originals. If licensing requires immediate withdrawal, use versioned catalogs and a tested disable/replace mechanism; account for CDN cache propagation and contract terms. A larger catalog may move audio to authorized object storage/CDN and introduce catalog APIs as specified in [catalog expansion](CATALOG_EXPANSION.md).

## Rollback

Keep the prior successful deployment. On a bad release, roll back the production alias, then verify the public URL and media files. For a rights issue, rollback alone may not remove a historically deployed asset; unpublish the catalog entry, remove/restrict the media object where possible, and review retained deployments/cache with the provider. Rehearse both paths before launch.
