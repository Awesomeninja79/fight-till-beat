# Rights, copyright, and credits

Runtime policy update: at the owner’s explicit request, Jamendo playback is no longer blocked by license category or missing authored cues. The app retains artist, provider and supplied license links, and does not label streams rights-cleared. Personal-project intent is recorded; API/per-track conditions and any later commercial/public usage review remain unresolved. Older discovery-only restrictions are superseded, not evidence of clearance.

Jamendo search includes singles and albums across the provider catalog, credits artists/provider and links to source pages; developer access does not grant game-use rights. No Jamendo audio/artwork has been added as a production asset. Lean On is no longer listed, per owner request on 2026-09-27; MUSIC-004 remains an unresolved historical request, not clearance. Confirm exact recording rights and applicable commercial API agreement before ingestion/public enablement.

## Release policy

Lean On (MUSIC-004): the owner reports permission and possession of authorized audio. No recording or private scope evidence has been supplied. The metadata placeholder was removed at owner request on 2026-09-27; audio, preview, and choreography remain absent. Do not substitute a sample, unofficial remix, or cover for the requested original. No free game-use source was verified in this work. Library/API access is not itself track clearance.

An asset may be used in a protected prototype only if its use there is permitted. No asset may enter a public build unless its [asset register](../ASSET_REGISTER.md) row is marked Cleared, the evidence can be retrieved, and its credits/limitations are implemented. The project owner or designated rights reviewer signs off the release manifest. Legal counsel should review final agreements for the chosen launch markets. No technical control can guarantee freedom from claims.

## Music checklist

For every song, identify composition owners, master recording owners, performers, publishers, samples, and any underlying works. Obtain written rights for synchronization with interactive visuals, hosting/streaming or downloading in a web game, commercial use if applicable, editing/looping, previews/trailers, countries, duration, credit, and sublicensing needed for CDN delivery. Confirm whether a public URL/downloadable file is permitted. Record expiration and withdrawal handling.

A song and its recording are separately protected works. An ordinary consumer streaming subscription is not a game license. [U.S. Copyright Office](https://copyright.gov/engage/musicians/), [audiovisual licensing](https://www.copyright.gov/music-modernization/educational-materials/musicians-income.pdf).

Preferred acquisition is original commissioned music with signed contributor agreements and a sample-clearance warranty. For stock or Creative Commons assets, inspect the exact license version and chain of title. Avoid NonCommercial terms for potential commercial release; handle NoDerivatives, ShareAlike, and attribution obligations explicitly. [Creative Commons licenses](https://creativecommons.org/share-your-work/use-remix/cc-licenses/).

## Visual, code, and brand checklist

- Make hero, enemies, DJ, venue art, effects, UI, cover art, fonts, and promotional media original or specifically licensed for a browser game. Asset marketplace purchase receipts alone do not establish every embedded-use right.
- Do not copy recognizable characters, branding, costumes, animations, or music-video choreography. Review generated media for resemblance and record tool/terms/source inputs.
- Track dependencies, license texts, notices, and any obligations to publish source or attribution. Keep required credits accessible in the app.
- Search the intended name and domain for conflicts in launch markets before buying a domain or producing marketing materials.
- If a rights complaint arrives, record it, disable the track/asset, preserve evidence, and escalate to the operator and counsel. See [operations](OPERATIONS.md).

## Publishing gate

The offline analyzer always writes `review.status: draft` and false timing/rights approvals. New playable catalog IDs fail content validation without a matching audio SHA-256, language, approved review flags, reviewer identifier, and review date. These fields record reviewer attestations; code does not authenticate the reviewer or inspect private contracts. Human asset-register/evidence review remains mandatory. No new production asset or license has been acquired through the English/Hindi pipeline change, so the asset register and public credits are unchanged.

The release manifest contains only rights IDs in Cleared status. CI checks that each referenced asset maps to a valid rights ID; human review verifies actual evidence and contract scope. The catalog expansion service must automatically unpublish expired or withdrawn songs. Evidence files stay in private storage and are never bundled with the game.
