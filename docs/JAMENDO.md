# Jamendo playback and music search

## Current behavior

One search box and language filter cover originals and Jamendo. Empty search/All shows the three originals without an API call. Local matching is immediate; remote queries wait 500 ms, cancel stale work, and support retry and deduplicated pagination. Refreshing the same query after returning from a fight keeps existing rows selectable so Start cannot lose its selection mid-click. Other remains a local-only language filter. English/Hindi availability depends on the provider catalog.

At the owner's explicit request, all search results with a supported provider audio stream offer Preview and Start; there is no license-category or manual-cue approval gate in runtime playback. Search includes singles and album tracks without the old prolicensing filter. Missing streams remain unavailable. Cards, selection and transport are shared with originals. Artist/Jamendo backlinks and supplied Creative Commons license links appear beside results, in Now Playing and current-song credits. Enabling playback is not a rights-clearance assertion.

Start downloads/decodes the selected stream, estimates beats and constructs an in-memory fight map before starting the shared audio clock. Cancel, changing tracks and hiding the page during preparation invalidate pending work. Playing tracks pause on visibility loss. Replay and pause/resume retain the selected recording. Originals retain their authored cues.

## Automatic timing

The browser measures channel energy in approximately 10 ms windows without canceling opposite-phase stereo. Positive energy changes estimate a 65–180 BPM pulse using normalized autocorrelation. Beat positions follow nearby transients with a bounded tempo adjustment. Relative energy selects attacks, softer dodges or rests; recovery spacing prevents overlapping actions. Groups of 16 beats provide provisional phrase markers. No clear pulse falls back to a 120 BPM grid; silence produces no attacks. Estimated BPM is marked with ≈. Timing is approximate for syncopated, changing-tempo or beatless music; it is not human-reviewed choreography.

Analysis yields between chunks so Cancel stays responsive. The stream is limited to 24 MB and 10 minutes, with a 60-second load timeout. Oversize/unavailable/unsupported audio shows an actionable error and can be retried. Only one remote decoded recording plus the small originals is retained in page memory; nothing is saved for offline access. No provider artwork is loaded.

## Configuration and API

Keep JAMENDO_CLIENT_ID in git-ignored .env.development.local (empty template in ../.env.example), never a VITE_ variable. Vite serves /api/jamendo through server/jamendo.ts; api/jamendo.ts shares the handler for Vercel. Environment changes require a development restart. Static-only hosting and vite preview do not provide this endpoint. Production environment setup and deployment remain unverified.

GET /api/jamendo?q=rock&language=all&offset=0 returns tracks and nextOffset, or an error. Track fields: id, title, artist, durationSec, url, audio, licenseUrl. Queries allow 2–100 characters unless a supported language is set; pages contain at most 12 items, offsets 0–120 in multiples of 12. English/Hindi use lang; Instrumental uses vocalinstrumental. Search passes type=single albumtrack, audioformat=mp31 and include=licenses.

The fixed HTTPS metadata endpoint has an eight-second timeout and rejects redirects. Metadata URLs are validated before returning them: playback hosts are prod-N.storage.jamendo.com or mp3l.jamendo.com; license links use creativecommons.org. URLs with credentials, custom ports or client credential parameters are rejected. Known HTTP provider/license links are upgraded to HTTPS. Browser media fetches omit credentials and referrers; they depend on provider CORS. The server does not proxy arbitrary audio URLs. Text renders through React escaping.

Responses use no-store. Identical in-flight searches share one upstream request, with no completed-result server cache. A per-instance aggregate 30-requests/minute limiter retains no user identifiers; it is not distributed abuse protection. Failures are manually retried.

## Data and release status

Search words/filters go to the same-origin API and Jamendo after the debounce. Hosting logs may contain query URLs. Preview/Start also sends the visitor's IP address and selected-track request directly to Jamendo storage. Audio and generated cues remain in browser memory; no uploads, microphone capture, offline files or user OAuth are added. The UI privacy notice explains this flow.

The owner describes this as a personal project and requested playback without per-song runtime blocking. This does not establish that every track permits every use. Preserve provider attribution and license information. API terms, per-track use, public release, monetization, privacy/contact, abuse quotas, device performance and full-song audible timing remain review gates. No permission purchase, provider agreement or deployment was performed.

[Tracks API](https://developer.jamendo.com/v3.0/tracks), [API terms](https://devportal.jamendo.com/api_terms_of_use). The offline reviewed publication process remains in [CONTENT_PIPELINE.md](CONTENT_PIPELINE.md); session-generated fights do not publish new catalog assets.
