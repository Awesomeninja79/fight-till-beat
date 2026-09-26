# Asset rights register

This is the working register, not final clearance. Keep contracts, license copies, and private evidence outside the public repository. Mark an item cleared only after the named operator reviews ownership, source inputs, worldwide web distribution, possible future ad use, and resemblance or third-party material.

| ID | Asset | Creator and source | Rights basis | Evidence | Status |
| --- | --- | --- | --- | --- | --- |
| MUSIC-001 | `public/audio/neon-strike.wav`, cue JSON | Original deterministic synthesis in `scripts/generate-music.py`; no imported samples | Original project composition and recording | Source generator, committed output, generation recipe | Pending operator review |
| MUSIC-002 | `public/audio/after-hours.wav`, cue JSON | Original deterministic synthesis in `scripts/generate-music.py`; no imported samples | Original project composition and recording | Source generator, committed output, generation recipe | Pending operator review |
| MUSIC-003 | `public/audio/laser-rush.wav`, cue JSON | Original deterministic synthesis in `scripts/generate-music.py`; no imported samples | Original project composition and recording | Source generator, committed output, generation recipe | Pending operator review |
| SFX-001 | Fight impact effects | Original Web Audio synthesis in `src/audio/AudioEngine.ts`; no imported samples | Original project sound design | Committed source | Pending operator review |
| VISUAL-001 | Fighters, DJ, venue, lights | Procedural geometry and materials in `src/scene/ClubScene.tsx` | Original project visual design | Committed source and screenshots | Pending resemblance review |
| UI-001 | Interface and favicon | Project CSS and SVG; browser system font stack | Original project design | Committed source | Pending final review |

Runtime dependencies and their exact versions are captured in `pnpm-lock.yaml`; license review and notices remain a release task. New songs need separate records for composition, master recording, performer rights, samples, commercial game sync, worldwide territory, modification, and promotional use. A streaming-library subscription alone does not grant those permissions.
