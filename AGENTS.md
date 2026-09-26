# Repository instructions

These instructions apply to all work in this repository.

## Keep project documents current

Treat [README.md](README.md) as the document index and [PLAN.md](PLAN.md) as the current delivery summary. The files under `docs/` and [ASSET_REGISTER.md](ASSET_REGISTER.md) are living source-of-truth documents. When work changes a product requirement, architecture, audio/choreography behavior, catalog design, content pipeline, rights status, data flow, security control, accessibility behavior, test gate, deployment setup, operational procedure, or owner decision, update the relevant document **in the same change**. Do not postpone documentation to a later release.

Before finishing a change:

1. Check which documents in [README.md](README.md) are affected. Update only the affected ones, but make every material change explicit.
2. Record resolved or changed assumptions in [docs/DECISIONS.md](docs/DECISIONS.md). Keep open questions visible until the owner answers them.
3. For every added or replaced production asset, update [ASSET_REGISTER.md](ASSET_REGISTER.md) and the public credits if required. A plan entry does not count as rights clearance; keep evidence private.
4. Update requirement IDs, acceptance criteria, quality checks, and release gates when behavior changes. Keep implementation and documents consistent.
5. If a new document is created or renamed, update [README.md](README.md) and fix its links.
6. In the final work summary, state which documents changed and any production gates still open.

Do not claim a requirement, license, privacy review, test, or deployment gate has passed without evidence from the actual implementation or an authorized reviewer. If a task is documentation-only, say that no runtime tests were run. If a code-only change genuinely does not affect the documents, state that after checking the index.

User instructions take precedence over this repository rule.
