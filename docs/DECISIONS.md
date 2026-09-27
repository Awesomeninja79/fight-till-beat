# Decision register

Planning assumptions are explicit so implementation can proceed where safe. The project owner resolves items that affect external obligations before final content or deployment.

| ID | Decision | Current assumption | Needed by | Impact |
| --- | --- | --- | --- | --- |
| D-01 | Legal operator and support contact | Neeraj Saini is the individual operator; business contact email pending. Do not publish personal email. | Privacy text and production | Notice, contracts, claims, billing |
| D-02 | Initial countries served | Worldwide | License negotiation and production | Worldwide rights and regional privacy/legal review |
| D-03 | Commercial or paid project? | No ads at first; possible advertising later. Treat rights as commercial-ready and recheck hosting plan before monetization. | Hosting and music agreements | Vercel tier and license scope |
| D-04 | Music source | Original, commissioned, or directly licensed independent/production music with written game-use rights; owner approved a small English/Hindi catalog on 2026-09-26. Provider, budget, and recordings remain undecided. | Content complete | Composition/master/sample clearance |
| D-05 | Visual style | Owner rejected block-like fighters on 2026-09-26 and requested real characters with cool fighting animation. Follow-up owner direction rejects rigid motion and calls for anime-style combat, cinematic angles, and expressive moves. Retain the humanoid rig and neon venue while adding speed ramps, combinations, aerial movement, stylized rendering, and a music-driven shot director. Current local implementation uses Quaternius humanoids with outfit variants; final visual approval and distinct character identities remain open. | Vertical slice art | Asset creation and performance |
| D-06 | Mobile launch support | Yes, with Low preset | QA device selection | Performance and UI scope |
| D-07 | Catalog size at launch | Three playable originals plus requested Lean On. Broad music search requested; no provider connected yet. | Architecture | Static manifest versus catalog service |
| D-08 | Future streaming-service integration | None | Future roadmap | Separate negotiated rights and provider terms |
| D-09 | Custom domain/brand name | Undecided | Branding and deployment | Trademark check, DNS, public URLs |
| D-10 | Budget and operations coverage | Undecided | Hosting setup | Plan tier, spend alerts, response commitments |
| D-12 | Language-independent beat authoring | Owner approved automatic candidate generation plus human timing correction for English/Hindi songs. Implemented offline Node PCM WAV analysis without new dependencies; corrected timestamp arrays support variable tempo. Live arbitrary-song detection and visitor uploads remain out of scope. | Music expansion | Human review before publication; no universal accuracy claim |
| D-13 | Music continuation | Add local catalog search/language filters, intensity-aware draft choreography, and preview cancellation. No new provider, purchase, upload feature, or song permission is inferred. Asked owner whether first recordings will be supplied or sourced from a paid library; answer remains open. | First English/Hindi playable content | Recording/source choice and rights evidence still needed |
| D-11 | Vercel first deployment | First `dev` deployment was labeled Production and canceled. A later `dev` commit (`27d5048`) deployed Ready as Preview; unauthenticated access redirected to Vercel SSO. Superseded on 2026-09-26: owner explicitly requested that the website be made live. Promote the tested artifact to public production with team access restored; outstanding reviews remain open. | Preview pipeline | No accidental public deployment while release gates remain open |

When a decision changes, update the affected source-of-truth documents, rights records, tests, and release gates. A larger catalog follows [CATALOG_EXPANSION.md](CATALOG_EXPANSION.md); adding an AI agent is not a prerequisite for beat tracking.

2026-09-26 follow-up: owner again rejected rigid attacks/weak combinations and requested a human DJ, cheering human crowd, and 50 techniques. Implemented a shared 50-profile catalog, full-body source clips plus analytic limb targets, cheering, and heavy-move recovery. Final realism/visual acceptance remains open; these are stylized adaptations rather than 50 authentic motion-capture demonstrations.

The owner reports authorized audio and permission for Lean On, then requested a free-library source. No recording was provided and no suitable free source for the original was verified. Record permission as owner-reported, not independently cleared. Provider choice, credentials, track licensing, exact recording, and cue ingestion remain open.

2026-09-26 implementation choice: reuse the CC0 Universal Base Characters / Universal Animation Library instead of generating another geometric placeholder. The official author pages specify CC0; downloaded exports came through a public mirror, so provenance and operator approval remain explicit production gates. No paid asset purchase, new service, or public deployment was made.

2026-09-26 public release direction: "make the website live" authorizes public production promotion of preview commit `3dda054`. This supersedes the earlier preview-only owner direction without representing rights, privacy, accessibility or performance review as complete. The connector continued to deny access after reconnection; direct Vercel CLI login restored team access. Public production promotion completed and anonymous gameplay smoke checks passed.

D-11 implementation result: public URL is https://project-3te70.vercel.app/; production commit `3dda054`. Changed the old preview-only Ignored Build Step to Automatic (`commandForIgnoringBuildStep: null`). Preview authentication stays enabled. No custom domain was purchased and no paid plan was enabled.
