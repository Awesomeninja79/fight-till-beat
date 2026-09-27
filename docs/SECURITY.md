# Security plan

Audio playback update: search now projects validated provider stream URLs and CC license URLs alongside metadata. HTTPS host allowlists reject arbitrary hosts, embedded credentials and custom ports; known HTTP provider links are upgraded. Direct browser media fetches omit credentials/referrers, require provider CORS, time out after 60 seconds, and enforce 24 MB / 10-minute playback limits. Cancellation invalidates delayed decode/analysis results. One remote decoded buffer is retained; disposal clears buffers. Metadata proxy controls remain. Older metadata-only statements are superseded.

Jamendo search adds a server-only Client ID, fixed upstream HTTPS endpoint, redirect rejection, validated/bounded inputs and pagination, eight-second timeout, redacted errors, validated metadata/stream/license projection and no-store responses. Identical active queries share one upstream request. An aggregate per-instance 30-request/minute limit retains no user identifiers; it is not distributed quota protection. Public enablement requires provider/platform abuse and cost review. Credential files are git-ignored. See [Jamendo](JAMENDO.md).

## Threat model

V1 serves static code, audio, models, JSON, and text. There is no user-authenticated API or upload path. Main risks are compromised npm packages, malicious third-party media/scripts, exposed deployment credentials, stale or unlicensed public assets, cross-site scripting in UI content, and denial-of-service or runaway bandwidth charges. A later catalog administration API introduces authentication, authorization, upload, malware, and audit-log risks and needs its own threat model.

## Engineering controls

- Pin dependencies with a lockfile and use clean installs in CI. Review vulnerability alerts and license inventory; pin CI actions and toolchain versions. Keep the number of dependencies small.
- Render metadata as text, not unsanitized HTML. Accept only schema-validated static content and known asset URLs. Avoid `eval`, remote scripts, and third-party widgets.
- Build a Content Security Policy around tested same-origin asset loads. Configure content-type protection, referrer policy, framing restriction, and HTTPS behavior via Vercel headers. Test CSP on preview before enforcement because 3D loaders/worker decoders may require explicit allowances. [Vercel configuration](https://vercel.com/docs/project-configuration/vercel-json).
- Treat the entire frontend build and `VITE_*` variables as public. No API keys, license evidence, deployment tokens, or private bucket credentials in the repository or bundle.
- Restrict Vercel project roles and production access; use protected previews. Review third-party account permissions and revoke former collaborators. [Deployment protection](https://vercel.com/docs/deployment-protection).
- Scan output for secrets and unintended files, inspect external requests, and verify source maps do not expose confidential content. Public source maps may be acceptable only after review.

## Large-catalog additions

An internal ingestion/admin service requires separate admin authentication with least privilege, signed short-lived uploads, file type and size limits, malware scanning, private originals, audit records, rate limits, and an explicit publish/unpublish approval. Public catalog endpoints are read-only and paginated. Never rely on a hidden admin URL as authorization.

## Security gate

The local music-analysis CLI bounds input to 100 MB, accepts only supported PCM WAV layouts, checks RIFF/chunk boundaries, and creates output exclusively so existing files are not overwritten. It resolves output parents and rejects drafts under repository `public/` or `dist/`. This is an operator tool, not a hardened untrusted-upload service or malware scanner. It must not be exposed as a public upload endpoint. Corrected beat arrays are validated; newly published songs require exact recording hashes and human review metadata. Review metadata is an attestation and not cryptographic authorization.

Production build, typecheck, dependency review, secret/output scan, CSP/header check, preview access check, and a documented security-contact path pass before launch. Any high-severity exploitable issue blocks release until fixed or formally risk-reviewed by the operator.
