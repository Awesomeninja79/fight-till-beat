# Decision register

Planning assumptions are explicit so implementation can proceed where safe. The project owner resolves items that affect external obligations before final content or deployment.

| ID | Decision | Current assumption | Needed by | Impact |
| --- | --- | --- | --- | --- |
| D-01 | Legal operator and support contact | Neeraj Saini is the individual operator; business contact email pending. Do not publish personal email. | Privacy text and production | Notice, contracts, claims, billing |
| D-02 | Initial countries served | Worldwide | License negotiation and production | Worldwide rights and regional privacy/legal review |
| D-03 | Commercial or paid project? | No ads at first; possible advertising later. Treat rights as commercial-ready and recheck hosting plan before monetization. | Hosting and music agreements | Vercel tier and license scope |
| D-04 | Music source | Original or commissioned with written rights | Content complete | Composition/master/sample clearance |
| D-05 | Visual style | Stylized neon arcade | Vertical slice art | Asset creation and performance |
| D-06 | Mobile launch support | Yes, with Low preset | QA device selection | Performance and UI scope |
| D-07 | Catalog size at launch | Three songs | Architecture | Static manifest versus catalog service |
| D-08 | Future streaming-service integration | None | Future roadmap | Separate negotiated rights and provider terms |
| D-09 | Custom domain/brand name | Undecided | Branding and deployment | Trademark check, DNS, public URLs |
| D-10 | Budget and operations coverage | Undecided | Hosting setup | Plan tier, spend alerts, response commitments |
| D-11 | Vercel first deployment | First `dev` deployment was labeled Production and canceled. A later `dev` commit (`27d5048`) deployed Ready as Preview; unauthenticated access redirected to Vercel SSO. Keep preview-only builds until public release gates pass. | Preview pipeline | No accidental public deployment while release gates remain open |

When a decision changes, update the affected source-of-truth documents, rights records, tests, and release gates. A larger catalog follows [CATALOG_EXPANSION.md](CATALOG_EXPANSION.md); adding an AI agent is not a prerequisite for beat tracking.
