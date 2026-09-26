# Operations and incident plan

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
