# Music, sound, and 3D content pipeline

## Source-to-release flow

The local prototype currently uses `scripts/generate-music.py` to render three deterministic original WAV tracks and cue maps, and `src/scene/ClubScene.tsx` to render original procedural 3D characters/venue. No imported audio samples or external fonts are used; humanoid GLB imports and current authoring are detailed below. The steps below describe the later production art/music pipeline.

1. **Acquire/create:** compose or license a track; model/animate original characters and arena; make original sound effects. Create a rights row before importing.
2. **Store masters privately:** retain DAW sessions, WAV masters, Blender source files, high-resolution textures, license evidence, and contributor contracts in access-controlled storage with backups.
3. **Export:** render a web audio master with known sample rate and loudness; export glTF/GLB models with named animation clips. Blender supports glTF 2.0 export of meshes, materials, textures, and animation. [Blender glTF manual](https://docs.blender.org/manual/en/3.6/addons/import_export/scene_gltf2.html).
4. **Optimize:** encode audio for supported browsers; compress/resize textures, simplify meshes and animation where appearance permits; test GLB loading. Three.js GLTFLoader supports glTF and compression extensions including KTX2 and meshopt with matching loaders/decoders. [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html).
5. **Analyze and author:** create candidate beat markers offline, human-correct them, author fight/lighting/camera cues, validate against the audio hash and duration.
6. **Review:** design, audio, rights, flash safety, visual readability, and performance review. Only approved exports enter `public/`.
7. **Publish:** add metadata and credits, run automated validators, build, test preview, release.

## Technical asset rules

- Use one immutable `trackId` per song version and a content hash. Replacing an audio file requires revalidating its cue map; a changed duration or master cannot silently reuse an old map.
- Keep filenames content-addressed or versioned so CDN caches cannot mix old audio with new cues.
- Keep the menu small: cover art and metadata load first; song audio and large 3D assets load only when needed.
- Normalize effect loudness relative to music through audition, not arbitrary peak matching. Avoid clipping; test phone speakers and headphones.
- Use original abstract shapes and colors for the first arena if commissioned 3D assets are delayed. Placeholder assets may be used in protected previews but cannot pass the production rights gate.
- Each published track receives title, creator credits, duration, content warning if needed, cue version, audio hash, rights ID, and release status.

## Tool ownership

### Current character imports

`public/models/fighter-v1.glb` is the textured Quaternius Superhero Male humanoid, obtained as an embedded web export from the mirror recorded in the asset register. `scripts/prepare-combat.mjs <source.glb>` extracts nine selected clips and their buffer data from the Universal Animation Library, removes unused mannequin geometry, and writes `public/models/combat-v1.glb` (1,114,028 bytes). The character export is 6,465,208 bytes. Source packs and downloaded license evidence are kept outside committed/public content. The runtime uses guard, jab, cross, jog, dance, crouch, and hit clips plus original additive kick/turn poses; the unused death clip is retained for follow-up choreography. Keep bone names intact and retain only pelvis translation when adapting to character proportions. Credits name Quaternius and CC0. Operator provenance/rights review remains pending before production.

Before replacing either GLB, verify embedded resources, named clip availability, skeleton bindings, asset hashes, download failure recovery, contact poses, pause/restart, and desktop/portrait framing. Re-run the quality gates; a successful export alone does not validate animation quality.

The anime follow-up reuses both GLBs unchanged. Spiked hair, scarf meshes, stepped shading, speed lines, slash arcs, and spark shapes are authored in project code. No anime franchise characters, purchased assets, textures, or animation downloads were introduced. Cue changes must also be represented in `scripts/generate-music.py`; the current combo rule adds an on-beat punch in selected bars without regenerating WAV files. Review accessories against every extreme pose, not just the bind pose.

Blender is the proposed external tool for models, rigs, and animations. A DAW or audio editor chosen by the music creator produces WAV masters and sound effects; the repository stores only approved web exports. A local Python batch tool using librosa may propose beats and onset markers, while a TypeScript validator checks the final cue JSON. [librosa beat tracking](https://librosa.org/doc/latest/auto_tutorials/03-advanced/plot_dynamic_beat.html). These authoring tools are not required in the visitor's browser and do not require a Codex plugin.

## Current imports and regeneration
Characters, DJ, and audience now use skinned GLBs; the venue remains procedural. `melee-v2.glb` adds five clips from the official free Quaternius Universal Animation Library 2 Standard archive. Run `scripts/prepare-combat.mjs <source.glb> <output.glb> <comma-separated names>` to strip mannequin meshes and retain named clips: Melee_Hook, Melee_Hook_Rec, Hit_Knockback, Idle_Rail_Loop, Idle_FoldArms_Loop. Source ZIP/license evidence stays private; credits identify Quaternius and all three packs.
`src/game/techniques.json` stores 50 project-authored motion profiles, not 50 imported clips. `node scripts/choreograph.mjs` regenerates cues after technique changes; the Python music generator invokes it automatically and preserves audio-required entries. The old Python per-beat rule is superseded by this pass. Lean On requires the actual owner-authorized recording and reviewed cues before becoming playable.
