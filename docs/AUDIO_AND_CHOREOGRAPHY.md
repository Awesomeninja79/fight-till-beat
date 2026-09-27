# Audio timing and choreography

## Timing contract

The selected song's Web Audio `AudioContext.currentTime` is the only clock used for gameplay. On Start, schedule a decoded `AudioBufferSourceNode` for a near-future context time `t0`. Current song time is `context.currentTime - t0 + seekOffset` while playing. On pause, store song position and stop the one-shot source. On resume, create a new source starting at that offset. AudioBufferSourceNode can only be started once, so a new node is required after pause/restart. [Web Audio start](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start), [audio clock](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/currentTime).

For visibility loss or audio interruption, pause both audio and visuals. On return, show Resume; do not silently continue the fight. The renderer samples state from song time each frame. A low frame rate may skip intermediate visuals but cannot change the audio position. An event has a stable ID and is applied only when its time window is crossed; reconstructed pose and state are derived from the timeline so seeking or pause never duplicates damage/score.

## Cue-map data contract

New imported maps now include `audioSha256`, `language` (`en`, `hi`, `instrumental`, `other`), `review`, and `analysis` alongside schema v1 fields. `scripts/music-pipeline.mjs` generates draft beats and deterministic fight events offline; `--beats` accepts manually corrected variable-tempo timestamps. New catalog IDs must have matching exact audio hashes, matching language metadata, approved timing/rights attestations with reviewer and date, and valid beats before content validation passes. Legacy original maps remain grandfathered unless review/hash fields are added. This does not verify contracts or the accuracy of a human review. See the [authoring procedure](CONTENT_PIPELINE.md).

The current schema stores integer milliseconds: `trackId`, `schemaVersion`, `bpm`, `durationMs`, `beatsMs`, `phrasesMs`, and `events`. Events currently carry `id`, `atMs`, `kind`, `actorId`, and `targetId`. Build-time validation checks track IDs, duration, sorted beats, move types, targets, and move-to-beat alignment. Imported recordings also pass the hash/review checks described above; a future authored animation system can add anticipation, recovery, intensity, camera, and lighting fields.

Validation rules: times sorted and within duration; IDs unique; referenced actors and animations exist; impact cues attach to a beat within the authored tolerance; every attack has an anticipation and reaction; a finisher appears before the ending; no conflicting actor moves overlap without an explicit blend rule; safe-lighting rules hold. Any failed validation blocks publishing the track.

## Choreography model

The fight director chooses a short move vocabulary (idle, step, jab, cross, kick, dodge, launch, finisher). An attack's **contact frame** aligns to the authored impact cue. Wind-up begins earlier; opponent reaction, particles, short sound effect, combo increment, and light accent occur at contact. Camera cuts occur on phrase or major beat boundaries, not every beat. Cooldown and spacing rules prevent impossible rapid actions. DJ and crowd gestures use lower-priority beat and phrase cues.

Music analysis proposes beat/downbeat and phrase markers, but a human reviews the track and may move or remove cues. The engine never uses raw amplitude peaks as a direct trigger for punches. See [catalog expansion](CATALOG_EXPANSION.md) for batch analysis of many songs.

### Implemented humanoid sampler

Fighter poses, camera, DJ, lighting, and effects sample absolute song time, including paused/finished states. Mixers do not accumulate frame delta. Non-step events reserve 320 ms anticipation and 460 ms recovery. The final 650 ms available between windows becomes a curved dash, facing travel direction before turning toward the target. When windows overlap, the upcoming hero wind-up takes priority; opponent hit reactions have independent windows. Step cues do not cancel attacks. Jab/cross contact samples remain at 0.20/0.30 s in the source clips. `strikeTime` holds the load, accelerates over the final 120 ms before the cue, holds contact for 45 ms, then recovers at 1.55x clip speed. Audio playback and cue time are never slowed for this visual hold.

Kicks use knee chamber/extension, torso counterrotation, and a small hop. The finisher adds a full turn and 0.65-unit hero leap. Launch/finisher reactions lift opponents by 1.0/1.15 units with backward recoil and 0.9/1.15 s recovery. These are choreographed curves, not rigid-body simulation. Idle guard time, shoulders, spine, legs, and head vary continuously instead of holding one pose. Scarf motion follows the same clock; sampled bone rotations are restored before additive motion to prevent accumulation. A dodge cue pairs the hero's crouch/slip with an opponent cross.

Selected bar patterns now replace step cues with punches on beat index modulo four equal to one (bar modulo four one or two). This adds 14/11/15 scored, sounded hits to Neon Strike/After Hours/Laser Rush respectively. The Python generator has the same rule; audio recordings are unchanged. Band-pass noise swooshes precede attack contact by 130 ms and use the existing effects bus, mute, and pause/resume scheduling. Final measured audio-to-visible-contact accuracy across all tracks remains unverified.

## Sound design

Music continuation: offline draft generation uses normalized beat energy to leave rests in very quiet passages, space dodges through soft passages, and place technique attacks in energetic passages. The last generated attack becomes a finisher and its recovery window is enforced. The emitted `analysis.beatStrengths` array is a loudness heuristic for review, not a claim of downbeat/chorus understanding. Existing authored demo cues are unchanged; see [content pipeline](CONTENT_PIPELINE.md) for thresholds.

Audio playback now invalidates pending starts when stopping or requesting a new track. A slow earlier download cannot replace the newest preview or restart after cancellation. App transport request IDs also prevent stale preview status and fight-loading completion after returning home. Filtering/selecting tracks stops previews; hidden-tab menu previews stop as well. Pause/resume still uses the stored source-clock offset, and the scheduled 50 ms startup lead cannot subtract from that offset if paused before playback begins.

Music is the primary audio bus. The current build synthesizes original impact sounds with Web Audio oscillators/noise on a separate effects bus; both buses have separate volume controls and a shared mute. Impacts are scheduled against the same audio clock and rescheduled after pause/resume. Future swoosh, footstep, crowd, or DJ effects need source and rights records before inclusion. Record every sound's provenance in the [rights register](../ASSET_REGISTER.md).

## Verification

- Unit test time calculation, one-shot source replacement, pause/resume, cue sorting, invalid references, and event deduplication.
- Capture representative sequences with audio and video; compare measured contact frames to cue times. Target median visible impact error within 50 ms and no obvious accumulating drift over a full song. Record actual measurements and devices.
- Test browser tab hidden for 30 seconds, device sleep/wake, audio device change, restart, track switch, failed decode, and end-of-track.
- Measure lighting and effects against accessibility limits separately; beat sync does not justify unsafe flashing.

## Current connected-technique sampler
This supersedes the earlier single-action/kick-envelope description. `attackLayersAt` blends outgoing recovery with incoming anticipation. `martialArts.ts` supplies continuous chamber/extension/rechamber channels and limb-length-preserving two-bone IK; support-foot targets stabilize stance. Quaternius UAL2 supplies hook/recovery, knockback, and venue idle clips. Fifty profiles specify side, contact height/reach, arc, turn, crouch, and jump. Judo-inspired techniques pair a close hero pose with an opponent tumble; fictional jutsu use palm/strike motion and purple impacts. These are stylized procedural adaptations; authentic grappling/contact and final polish remain review gates.
`scripts/choreograph.mjs` is the authoritative current cue generator. The Python audio generator invokes it and preserves requested catalog entries. Techniques cycle in different orders per song, remain on musical beats, keep a four-bar phrase on one opponent, and leave 1,250 ms before the next attack after launch/throw/finisher. Current maps contain 68/60/72 actions for Neon Strike/After Hours/Laser Rush, including dodge/dance; all 50 techniques occur across the catalog. Optional event `technique` IDs are validated against the shared catalog. The move book pauses playback; closing leaves Resume available. Audio speed is unchanged.

Throw framing now follows the 1.2-second opponent reaction rather than ending at the hero's 460 ms recovery window. Waiting opponents move aside continuously according to hero position so they do not overlap the throw lane; active targets remain at their authored contact position. DJ hand IK targets the decks.
