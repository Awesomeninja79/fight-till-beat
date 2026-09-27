// Contact times are musical beats; each four-bar phrase stays on one opponent.
import { readFileSync, writeFileSync } from 'node:fs'
const root = new URL('../public/content/', import.meta.url)
const tracks = JSON.parse(readFileSync(new URL('tracks.json', root), 'utf8'))
const techniques = JSON.parse(readFileSync(new URL('../src/game/techniques.json', import.meta.url), 'utf8'))
const motifs = [
  [['punch', 'jab'], ['punch', 'cross'], ['punch', 'hook'], ['kick', 'roundhouse']],
  [['dodge'], ['punch', 'cross'], ['punch', 'hook'], ['kick', 'side-kick']],
  [['punch', 'jab'], ['punch', 'cross'], ['launch', 'uppercut'], ['step']],
  [['punch', 'hook'], ['kick', 'roundhouse'], ['step'], ['step']],
]
for (const [trackIndex, track] of tracks.filter(t => t.status !== 'audio-required').entries()) {
  // Imported maps belong to the analysis/review pipeline, not demo regeneration.
  if (!['neon-strike', 'after-hours', 'laser-rush'].includes(track.id)) continue
  const file = new URL(`${track.id}.json`, root)
  const cue = JSON.parse(readFileSync(file, 'utf8'))
  const bars = cue.beatsMs.length / 4
  let cursor = trackIndex * 17, nextAttack = 0
  cue.events = cue.beatsMs.flatMap((atMs, i) => {
    const bar = Math.floor(i / 4), beat = i % 4
    if (bar < 4 || bar >= bars - 2) return []
    let [kind, move] = motifs[bar % 4][beat]
    if (bar >= bars * .62 && bar < bars * .72) { kind = beat === 0 ? 'dodge' : beat === 2 ? 'dance' : 'step'; move = undefined }
    if (kind === 'launch' && bar > bars - 8) { kind = 'finisher'; move = 'spin-kick' }
    if (kind === 'step') return []
    let technique
    if (['punch', 'kick', 'launch', 'finisher'].includes(kind)) {
      if (atMs < nextAttack) return []
      technique = techniques[cursor++ % techniques.length]
      kind = technique.kind
      nextAttack = atMs + (kind === 'launch' || kind === 'finisher' ? 1250 : 350)
    }
    return [{ id: `${track.id}-${i}`, atMs, kind, ...(technique ? { technique: technique.id } : {}), actorId: 'hero', targetId: `enemy-${Math.floor(bar / 4) % 3 + 1}` }]
  })
  writeFileSync(file, JSON.stringify(cue))
  console.log(`${track.title}: ${cue.events.length} authored actions`)
}
