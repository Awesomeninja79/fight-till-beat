# Operations and incident plan

Jamendo playback troubleshooting: verify metadata includes an allowed audio URL, then inspect browser media CORS/network and decode failures. Start shows loading and beat-analysis phases and can be canceled; errors return to selection for retry. Limits are 24 MB, 10 minutes and a 60-second load timeout. Provider outages or unsupported streams do not change local originals. Direct media bandwidth flows from Jamendo to the visitor; test actual devices before release.

Jamendo operations: missing `JAMENDO_CLIENT_ID` returns 503; input/method errors return 400/405, quota pressure 429, provider/network failures 502. Retry manually after recovery; do not log upstream credential-bearing URLs or bypass limits. Verify server-only configuration and provider application state. The 30/minute limiter and in-flight coalescing are per instance, not a global quota. To disable discovery, remove its server environment value and redeploy/restart; gameplay of local songs remains independent. See [Jamendo](JAMENDO.md).

## Ownership

The site operator owns the domain, hosting plan, billing, privacy notice, support mailbox, contracts, and production approval. Engineering owns release builds, dependency updates, monitoring checks, and rollback. A designated rights reviewer owns the asset register and expiration calendar. One person may fill several roles, but names and backups should be recorded before launch.

## Daily/weekly signals

- Verify public URL and key static asset availability with an external synthetic check; static Vercel deployments have no app server process to monitor.
- Review hosting transfer/usage, deployment status, and budget notifications. Pro spend management can notify or pause at configured thresholds, but behavior must be explicitly set. [Vercel spend management](https://vercel.com/docs/spend-management).
- Review support and rights complaints promptly. Track asset license expiry and planned renewal dates.
- Review dependency advisories and browser regressions after browser or package updates. Keep a known-good deployment and release log.

No user-level analytics or behavioral tracking at initial launch. If an error-reporting SDK is later proposed, privacy and security review precedes installation.

## Incident playbooks

| Incident | Immediate action | Follow-up |
| --- | --- | --- |
| Game does not load or a song fails | Check deployment and asset responses; roll back if release-related | Fix and re-test preview before redeploying |
| Wrong or uncleared song/asset ships | Disable/remove public catalog entry and asset; notify rights reviewer/operator | Preserve evidence, assess claims, purge or replace cached copies where possible |
| Copyright/trademark complaint | Acknowledge through contact channel; stop affected use pending review | Counsel/owner determines response and restoration |
| Unexpected data flow or leaked credential | Disable affected integration or rotate secret; restrict deployment if needed | Determine exposure, obligations, notice, and root cause |
| Cost spike | Inspect transfer and traffic; invoke configured spending controls | Optimize assets, review abuse/traffic, adjust budget and capacity |
| Accessibility safety issue | Disable affected effect or track quickly | Correct, re-test, and document fix |

## Recovery targets

For v1, prioritize a rollback or track disable within the operator's active support window rather than promising 24/7 response without staff. Record actual response coverage and contact route on launch. Back up source, private asset masters, rights evidence, and deployment config; periodically test restoring a build from a clean checkout.

## Change control

Every new song, sound, model, dependency, analytics SDK, external service, or user-data feature passes the matching rights, privacy, security, accessibility, and quality gates before publishing. Release notes list changed content and code, reviewer, and rollback target.

## Current public baseline
On 2026-09-26, owner-authorized release `3dda054` became production `dpl_AVTMY3GND6iBiRs8dbrEQkbxyrX6` at https://project-3te70.vercel.app/. Use this domain for anonymous availability checks; team/deployment aliases may require Vercel sign-in. Preserve this first successful public deployment as the recovery baseline; no earlier production rollback target exists. Automatic production builds are enabled, while GitHub main branch protections and preview authentication remain in place. Future releases follow the protected-main workflow. Support contact, response coverage, monitoring/budget configuration and rollback rehearsal remain open. See [deployment](DEPLOYMENT.md) for evidence and known limitations.
