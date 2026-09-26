import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('../public/', import.meta.url).pathname.replace(/^\/(?:([A-Za-z]):\/)/, '$1:/')
const readJson = path => JSON.parse(readFileSync(join(root, path), 'utf8'))
const tracks = readJson('content/tracks.json')
const errors = []
const validKinds = new Set(['punch', 'kick', 'dodge', 'dance', 'launch', 'finisher', 'step'])

if (!Array.isArray(tracks) || tracks.length !== 3) errors.push('Launch catalog must contain three tracks.')
const ids = new Set()
for (const track of tracks) {
  if (ids.has(track.id)) errors.push(`Duplicate track ID: ${track.id}`)
  ids.add(track.id)
  if (!track.rightsId || !track.title || !track.artist || !track.mood) errors.push(`Missing metadata for ${track.id}`)
  if (!/^#[0-9a-fA-F]{6}$/.test(track.colors?.[0] ?? '')) errors.push(`Invalid color for ${track.id}`)
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
      if (!['enemy-1', 'enemy-2', 'enemy-3'].includes(event.targetId)) errors.push(`Invalid target: ${event.id}`)
      if (!cue.beatsMs.some(beat => Math.abs(beat - event.atMs) <= 1)) errors.push(`Move not on beat: ${event.id}`)
    }
    if (!cue.events?.some(event => event.kind === 'finisher')) errors.push(`No finisher for ${track.id}`)
  } catch (error) { errors.push(`Cue map missing or invalid for ${track.id}: ${error.message}`) }
}

if (errors.length) {
  for (const error of errors) console.error('✗', error)
  process.exit(1)
}
console.log(`✓ Validated ${tracks.length} original tracks, audio files, and beat maps.`)
