# Audio timing and choreography

## Timing contract

The selected song's Web Audio `AudioContext.currentTime` is the only clock used for gameplay. On Start, schedule a decoded `AudioBufferSourceNode` for a near-future context time `t0`. Current song time is `context.currentTime - t0 + seekOffset` while playing. On pause, store song position and stop the one-shot source. On resume, create a new source starting at that offset. AudioBufferSourceNode can only be started once, so a new node is required after pause/restart. [Web Audio start](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start), [audio clock](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/currentTime).

For visibility loss or audio interruption, pause both audio and visuals. On return, show Resume; do not silently continue the fight. The renderer samples state from song time each frame. A low frame rate may skip intermediate visuals but cannot change the audio position. An event has a stable ID and is applied only when its time window is crossed; reconstructed pose and state are derived from the timeline so seeking or pause never duplicates damage/score.

## Cue-map data contract

The current schema stores integer milliseconds: `trackId`, `schemaVersion`, `bpm`, `durationMs`, `beatsMs`, `phrasesMs`, and `events`. Events currently carry `id`, `atMs`, `kind`, `actorId`, and `targetId`. Build-time validation checks track IDs, duration, sorted beats, move types, targets, and move-to-beat alignment. Before publishing externally sourced or replaceable audio, extend the schema with an audio content hash and validate it against the exact recording; a future authored animation system can add anticipation, recovery, intensity, camera, and lighting fields.

Validation rules: times sorted and within duration; IDs unique; referenced actors and animations exist; impact cues attach to a beat within the authored tolerance; every attack has an anticipation and reaction; a finisher appears before the ending; no conflicting actor moves overlap without an explicit blend rule; safe-lighting rules hold. Any failed validation blocks publishing the track.

## Choreography model

The fight director chooses a short move vocabulary (idle, step, jab, cross, kick, dodge, launch, finisher). An attack's **contact frame** aligns to the authored impact cue. Wind-up begins earlier; opponent reaction, particles, short sound effect, combo increment, and light accent occur at contact. Camera cuts occur on phrase or major beat boundaries, not every beat. Cooldown and spacing rules prevent impossible rapid actions. DJ and crowd gestures use lower-priority beat and phrase cues.

Music analysis proposes beat/downbeat and phrase markers, but a human reviews the track and may move or remove cues. The engine never uses raw amplitude peaks as a direct trigger for punches. See [catalog expansion](CATALOG_EXPANSION.md) for batch analysis of many songs.

## Sound design

Music is the primary audio bus. The current build synthesizes original impact sounds with Web Audio oscillators/noise on a separate effects bus; both buses have separate volume controls and a shared mute. Impacts are scheduled against the same audio clock and rescheduled after pause/resume. Future swoosh, footstep, crowd, or DJ effects need source and rights records before inclusion. Record every sound's provenance in the [rights register](../ASSET_REGISTER.md).

## Verification

- Unit test time calculation, one-shot source replacement, pause/resume, cue sorting, invalid references, and event deduplication.
- Capture representative sequences with audio and video; compare measured contact frames to cue times. Target median visible impact error within 50 ms and no obvious accumulating drift over a full song. Record actual measurements and devices.
- Test browser tab hidden for 30 seconds, device sleep/wake, audio device change, restart, track switch, failed decode, and end-of-track.
- Measure lighting and effects against accessibility limits separately; beat sync does not justify unsafe flashing.
