# More songs and automatic beat analysis

## Two catalog sizes

2026-09-26 approved direction: grow a small cleared English/Hindi catalog first. Offline draft generation and manual timestamp correction are now implemented through `pnpm music:analyze`; see [content pipeline](CONTENT_PIPELINE.md). Catalog validation permits additional reviewed tracks while retaining the original demos. Language is metadata, not a separate beat detector. New entries require recording hashes and human timing/rights attestations. Local catalog search and language filters are implemented; a provider connection, new recordings, and purchases remain pending.

Jamendo Licensing and Universal Production Music are candidates to investigate for game-use agreements; specific English/Hindi vocal availability, interactive use, worldwide delivery, and pricing remain unverified. No provider is selected. The current detector is a dependency-free constant-tempo energy-grid prototype. It cannot guarantee arbitrary-song beat accuracy; manual timestamp correction supports tempo changes. Draft choreography now responds to relative beat energy (rests, dodges, attacks). Musical section recognition and a more capable offline detector remain future improvements.

Search matches all entered words against title, artist, mood, and the language label using Unicode normalization and case-insensitive comparison, entirely in memory. English, Hindi, Instrumental, and Other filters intersect with search. Requested tracks remain unavailable in results. A hidden selection cannot start playback; the visitor selects a visible playable result or clears filters. No matching Hindi songs displays an honest empty state. Current originals are tagged Instrumental; Lean On is English and still audio-required. Search/filter values are not stored or sent to a server.

**V1 curated catalog:** three to a few dozen songs whose rights and cue maps are reviewed manually. Static JSON and same-origin files remain simple, cheap to operate, and privacy-light. Search/filter UI can work on the local manifest.

**Large managed catalog:** if songs are added regularly or the list becomes too large to ship as one manifest, add an authenticated internal publishing service, relational catalog database, object storage/CDN for audio and artwork, background analysis worker, and paginated public catalog API. Visitors still do not need accounts. This is a later architecture milestone, not a dependency of the first release.

## Proposed ingestion pipeline for a large catalog

```text
rights/contract approval
  → private upload + malware/format check + file hash
  → audio encode and metadata extraction
  → offline beat/onset/tempo/phrase candidate generation
  → human music editor correction + choreography templates
  → schema, sync, flash, and rights validation
  → staged preview
  → publish status + CDN assets + searchable catalog record
```

Catalog record: immutable ID/version, title, artist/credit, genre and mood tags, duration, artwork, audio object key and hash, cue-map key and hash, territory, license start/end, availability state, rights evidence reference, review approvals, published/withdrawn timestamps. The public API exposes only approved metadata and signed or public asset URLs appropriate to the license. Rights evidence stays private. A takedown switches availability off immediately and then removes assets/caches as allowed by the hosting design.

The ingestion worker runs separately from the public web app. It can use Python and librosa for onset and beat candidate detection. Beat tracking is an estimation problem: half/double tempo, syncopation, intros, breaks, and tempo changes can be wrong. Review all launch songs and prioritize low-confidence sections for manual correction. Human-approved cue maps, not live detector output, drive the fight. [librosa beat tracking](https://librosa.org/doc/latest/auto_tutorials/03-advanced/plot_dynamic_beat.html), [onset detection](https://librosa.org/doc/main/auto_tutorials/01-intro/05-onsets.html).

An **AI agent is not required**. Beat detection is signal analysis; an agent would add orchestration and review complexity without solving music rights or guaranteeing timing. A trained music model could later propose downbeats, sections, or move patterns, but it must run offline, record its model/version and outputs, and pass human review. Do not send licensed audio to a third-party AI provider unless the music agreement permits it and the provider's processing/privacy terms are reviewed. If “new sounds” means new effect sounds, produce or license them and add them to the effects bus and rights register. If it means newly composed songs, run the full ingestion process.

## Music-service integrations

Owner follow-up, 2026-09-26: wants search approaching mainstream-song coverage. No free provider meeting that scope was verified. [Jamendo's API](https://developer.jamendo.com/v3.0) offers a large independent catalog. Its [terms](https://devportal.jamendo.com/api_terms_of_use) require registered application credentials, per-track license compliance, attribution/backlinks, and a commercial agreement where applicable. No SDK, remote search, streaming, or analytics was added. Connecting a provider needs selection, app registration, license filtering, approved audio/cue ingestion, and network/privacy review.

The current manifest supports `status: audio-required` entries with no playback URLs. Lean On is credited to Major Lazer & DJ Snake feat. MØ and awaits the owner-authorized file. Tency Music's [listing](https://www.tencymusic.com/music-licensing/major-lazer/lean-on.html) offers a separate cover recording, not the original or a verified free game-use source.

A large list from a commercial streaming service is **not** equivalent to a cleared game catalog. For example, Spotify's current developer policy prohibits games and synchronization of recordings with visual media. Do not design this product around Spotify playback or Spotify catalog imports without a separate negotiated agreement and legal review. [Spotify developer policy](https://developer.spotify.com/policy), [Spotify compliance examples](https://developer.spotify.com/compliance-tips). Likewise, YouTube API access does not grant general rights to download/cache its audiovisual content for this game. [YouTube API policy](https://developers.google.com/youtube/terms/developer-policies).

The feasible scalable route is a catalog of music the project owns or has directly licensed for interactive audiovisual use, served by its own authorized storage/CDN. Contract terms determine territories, expirations, previews, cache behavior, and takedown process.
