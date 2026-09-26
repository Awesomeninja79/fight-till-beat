# Rights, copyright, and credits

## Release policy

Lean On (MUSIC-004): the owner reports permission and possession of authorized audio. No recording or private scope evidence has been supplied. Metadata is listed with full artist credits; audio, preview, and choreography are absent. Do not substitute a sample, unofficial remix, or cover for the requested original. No free game-use source was verified in this work. Library/API access is not itself track clearance.

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

The release manifest contains only rights IDs in Cleared status. CI checks that each referenced asset maps to a valid rights ID; human review verifies actual evidence and contract scope. The catalog expansion service must automatically unpublish expired or withdrawn songs. Evidence files stay in private storage and are never bundled with the game.
