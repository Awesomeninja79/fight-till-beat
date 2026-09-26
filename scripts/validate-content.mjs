import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('../public/', import.meta.url).pathname.replace(/^\/(?:([A-Za-z]):\/)/, '$1:/')
const readJson = path => JSON.parse(readFileSync(join(root, path), 'utf8'))
const tracks = readJson('content/tracks.json')
const errors = []
const validKinds = new Set(['punch', 'kick', 'dodge', 'dance', 'launch', 'finisher', 'step'])
const techniques = JSON.parse(readFileSync(new URL('../src/game/techniques.json', import.meta.url), 'utf8'))
const techniqueIds = new Set(techniques.map(t => t.id))
const usedTechniques = new Set()
if (techniques.length < 50 || techniqueIds.size !== techniques.length) errors.push('At least 50 uniquely identified techniques are required.')

if (!Array.isArray(tracks) || tracks.filter(t => t.status !== 'audio-required').length !== 3) errors.push('Preview catalog must contain three playable originals.')
const ids = new Set()
for (const track of tracks) {
  if (ids.has(track.id)) errors.push(`Duplicate track ID: ${track.id}`)
  ids.add(track.id)
  if (!track.rightsId || !track.title || !track.artist || !track.mood) errors.push(`Missing metadata for ${track.id}`)
  if (!/^#[0-9a-fA-F]{6}$/.test(track.colors?.[0] ?? '')) errors.push(`Invalid color for ${track.id}`)
  if (track.status === 'audio-required') {
    if (!track.availabilityNote || track.audio || track.cues) errors.push(`Requested track must explain missing audio and contain no playback URLs: ${track.id}`)
    continue
  }
  if (track.status && track.status !== 'available') errors.push(`Invalid track status: ${track.id}`)
  try {
    const audioPath = join(root, track.audio.replace(/^\//, ''))
    const size = statSync(audioPath).size
    if (size > 6_000_000) errors.push(`Audio exceeds 6 MB: ${track.id}`)
    const header = readFileSync(audioPath).subarray(0, 44)
    if (header.toString('ascii', 0, 4) !== 'RIFF' || header.toString('ascii', 8, 12) !== 'WAVE') errors.push(`Invalid WAV: ${track.id}`)
    const sampleRate = header.readUInt32LE(24)
    const bytesPerSecond = header.readUInt32LE(28)
    const duration = (size - 44) / bytesPerSecond
    if (sampleRate !== 32000 || Math.abs(duration - track.durationSec) > 0.1) errors.push(`Audio duration mismatch: ${track.id}`)
  } catch (error) { errors.push(`Audio file missing or invalid for ${track.id}: ${error.message}`) }
  try {
    const cue = readJson(track.cues.replace(/^\//, ''))
    if (cue.schemaVersion !== 1 || cue.trackId !== track.id) errors.push(`Cue version/ID mismatch for ${track.id}`)
    if (Math.abs(cue.durationMs / 1000 - track.durationSec) > 0.1) errors.push(`Cue duration mismatch for ${track.id}`)
    if (!Array.isArray(cue.beatsMs) || cue.beatsMs.length < 64) errors.push(`Too few beats for ${track.id}`)
    if (!cue.beatsMs.every((time, i) => i === 0 || time > cue.beatsMs[i - 1])) errors.push(`Unsorted beats for ${track.id}`)
    const eventIds = new Set()
    for (const event of cue.events ?? []) {
      if (eventIds.has(event.id)) errors.push(`Duplicate event: ${event.id}`)
      eventIds.add(event.id)
      if (!validKinds.has(event.kind)) errors.push(`Invalid move: ${event.id}`)
      const moves = { punch: ['jab', 'cross', 'hook'], kick: ['roundhouse', 'side-kick'], launch: ['uppercut'], finisher: ['spin-kick'] }
      if (event.move && !moves[event.kind]?.includes(event.move)) errors.push(`Invalid attack variant: ${event.id}`)
      if (event.technique) {
        const technique = techniques.find(t => t.id === event.technique)
        if (!technique || technique.kind !== event.kind) errors.push(`Invalid technique reference: ${event.id}`)
        usedTechniques.add(event.technique)
      }
      if (!['enemy-1', 'enemy-2', 'enemy-3'].includes(event.targetId)) errors.push(`Invalid target: ${event.id}`)
      if (!cue.beatsMs.some(beat => Math.abs(beat - event.atMs) <= 1)) errors.push(`Move not on beat: ${event.id}`)
    }
    if (!cue.events?.some(event => event.kind === 'finisher')) errors.push(`No finisher for ${track.id}`)
  } catch (error) { errors.push(`Cue map missing or invalid for ${track.id}: ${error.message}`) }
}

if ([...techniqueIds].some(id => !usedTechniques.has(id))) errors.push('Every technique must appear in the playable cue maps.')
if (errors.length) {
  for (const error of errors) console.error('✗', error)
  process.exit(1)
}
console.log(`✓ Validated ${tracks.filter(t => t.status !== 'audio-required').length} playable tracks and ${tracks.filter(t => t.status === 'audio-required').length} requested entries.`)
