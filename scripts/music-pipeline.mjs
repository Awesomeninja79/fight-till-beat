import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, statSync, realpathSync } from 'node:fs'
import { resolve, dirname, relative, isAbsolute } from 'node:path'
import { fileURLToPath } from 'node:url'

const techniques = JSON.parse(readFileSync(new URL('../src/game/techniques.json', import.meta.url), 'utf8'))
export const audioHash = bytes => createHash('sha256').update(bytes).digest('hex')

// Walk RIFF chunks: WAV exports may contain metadata before their sample data.
export function decodeWav(bytes) {
  if (bytes.length < 44 || bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WAVE') throw Error('Expected a PCM WAV recording.')
  if (bytes.readUInt32LE(4) + 8 !== bytes.length) throw Error('Truncated or malformed RIFF size.')
  let format, data
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const size = bytes.readUInt32LE(offset + 4), start = offset + 8
    if (start + size > bytes.length) throw Error('Truncated WAV chunk.')
    const id = bytes.toString('ascii', offset, offset + 4)
    if (id === 'fmt ') format = bytes.subarray(start, start + size)
    if (id === 'data') data = bytes.subarray(start, start + size)
    offset = start + size + (size % 2)
  }
  if (!format || format.length < 16 || !data) throw Error('Missing WAV format or data.')
  const channels = format.readUInt16LE(2), sampleRate = format.readUInt32LE(4)
  if (format.readUInt16LE(0) !== 1 || format.readUInt16LE(14) !== 16 || ![1, 2].includes(channels) || sampleRate < 8000 || sampleRate > 96000) throw Error('Export 16-bit PCM mono/stereo WAV at 8–96 kHz.')
  const frameSize = channels * 2
  if (format.readUInt16LE(12) !== frameSize || format.readUInt32LE(8) !== sampleRate * frameSize || !data.length || data.length % frameSize) throw Error('Invalid PCM layout.')
  // Channel energy avoids cancellation in out-of-phase stereo recordings.
  const hop = Math.round(sampleRate / 100), energy = []
  for (let frame = 0; frame < data.length / frameSize; frame += hop) {
    let sum = 0, count = 0
    for (let j = frame; j < Math.min(frame + hop, data.length / frameSize); j++) {
      for (let c = 0; c < channels; c++) { const x = data.readInt16LE(j * frameSize + c * 2) / 32768; sum += x * x; count++ }
    }
    energy.push(Math.sqrt(sum / count))
  }
  return { energy, hopMs: hop / sampleRate * 1000, sampleRate, durationMs: Math.round(data.length / frameSize / sampleRate * 1000) }
}

export function validateBeats(beats, durationMs) {
  if (!Number.isInteger(durationMs) || durationMs <= 0) throw Error('Invalid recording duration.')
  if (!Array.isArray(beats) || beats.length < 8 || beats.some((t, i) => !Number.isInteger(t) || t < 0 || t >= durationMs || (i > 0 && t <= beats[i - 1]))) throw Error('Supply at least eight strictly increasing integer beat timestamps within the recording.')
}

export function analyzeBeats({ energy, hopMs, durationMs }) {
  const onset = energy.map((value, i) => Math.max(0, value - (energy[i - 1] ?? value)))
  const total = onset.reduce((sum, x) => sum + x, 0)
  if (total < 0.01) throw Error('No usable transients; supply a corrected beat JSON array with --beats.')
  let best = { score: -1, lag: 0 }
  for (let lag = Math.ceil(60000 / 180 / hopMs); lag <= Math.floor(60000 / 60 / hopMs); lag++) {
    let score = 0
    for (let i = lag; i < onset.length; i++) score += onset[i] * onset[i - lag]
    if (score > best.score) best = { score, lag }
  }
  if (best.score <= 0) throw Error('No repeating pulse found; supply corrected beats.')
  let phase = 0, phaseScore = -1
  for (let p = 0; p < best.lag; p++) {
    let score = 0
    for (let i = p; i < onset.length; i += best.lag) score += onset[i]
    if (score > phaseScore) { phase = p; phaseScore = score }
  }
  const beats = []
  for (let i = phase; i * hopMs < durationMs; i += best.lag) beats.push(Math.round(i * hopMs))
  validateBeats(beats, durationMs)
  return { beats, pulseSupport: Math.round(phaseScore / total * 1000) / 1000 }
}

export function beatStrengths(audio, beats) {
  const values = beats.map(atMs => {
    const start = Math.max(0, Math.floor((atMs - 50) / audio.hopMs))
    const end = Math.min(audio.energy.length, Math.ceil((atMs + 150) / audio.hopMs))
    let sum = 0
    for (let i = start; i < end; i++) sum += audio.energy[i] ** 2
    return Math.sqrt(sum / Math.max(1, end - start))
  })
  const sorted = [...values].sort((a, b) => a - b)
  const reference = Math.max(0.0001, sorted[Math.floor((sorted.length - 1) * 0.9)])
  return values.map(value => Math.round(Math.min(1, value / reference) * 1000) / 1000)
}

export function generateEvents(trackId, beats, durationMs, strengths) {
  if (strengths && (strengths.length !== beats.length || strengths.some(value => !Number.isFinite(value) || value < 0 || value > 1))) throw Error('Beat strengths must match the beats and range from zero to one.')
  const events = []; let next = 320, cursor = 0
  for (let i = 0; i < beats.length; i++) {
    const atMs = beats[i]
    if (atMs < next || atMs > durationMs - 1500) continue
    const strength = strengths?.[i] ?? 1
    if (strength < 0.12) continue
    if (strength < 0.5) {
      events.push({ id: `${trackId}-${i}`, atMs, kind: 'dodge', actorId: 'hero', targetId: `enemy-${Math.floor(i / 16) % 3 + 1}` })
      next = atMs + 1600
      continue
    }
    const technique = techniques[cursor++ % techniques.length]
    events.push({ id: `${trackId}-${i}`, atMs, kind: technique.kind, technique: technique.id, actorId: 'hero', targetId: `enemy-${Math.floor(i / 16) % 3 + 1}` })
    // Reserve full recovery, including opponent reactions after heavy moves.
    next = atMs + (['launch', 'finisher'].includes(technique.kind) ? 1250 : 800)
  }
  if (!events.length) throw Error('Recording has no room for combat anticipation and recovery.')
  const last = events.findLast(event => event.technique), finisher = techniques.find(t => t.kind === 'finisher')
  if (!last) throw Error('No energetic passage for a finisher; review the recording and author cues manually.')
  Object.assign(last, { kind: finisher.kind, technique: finisher.id })
  // A final replacement can extend recovery beyond the ordinary move it replaces.
  const finalEvents = events.filter(event => event.atMs <= last.atMs || event.atMs >= last.atMs + 1250)
  return finalEvents
}

export function createDraft(bytes, trackId, language, correctedBeats) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trackId)) throw Error('Use a lowercase hyphenated track ID.')
  if (!['en', 'hi', 'instrumental', 'other'].includes(language)) throw Error('Language must be en, hi, instrumental, or other.')
  const audio = decodeWav(bytes)
  const analysis = correctedBeats ? { beats: correctedBeats, pulseSupport: null } : analyzeBeats(audio)
  validateBeats(analysis.beats, audio.durationMs)
  const intervals = analysis.beats.slice(1).map((t, i) => t - analysis.beats[i]).sort((a, b) => a - b)
  const strengths = beatStrengths(audio, analysis.beats)
  return { schemaVersion: 1, trackId, language, audioSha256: audioHash(bytes), durationMs: audio.durationMs,
    bpm: Math.round(60000 / intervals[Math.floor(intervals.length / 2)] * 100) / 100,
    beatsMs: analysis.beats, phrasesMs: analysis.beats.filter((_, i) => i % 16 === 0),
    events: generateEvents(trackId, analysis.beats, audio.durationMs, strengths),
    review: { status: 'draft', timingApproved: false, rightsApproved: false },
    analysis: { version: 'energy-grid-v2', method: correctedBeats ? 'manual-beats' : 'constant-tempo-candidate', pulseSupport: analysis.pulseSupport, beatStrengths: strengths,
      warnings: ['Human timing and rights review required.', 'Automatic grid assumes steady tempo and may select half/double time.', 'Phrase markers are provisional groups of 16 beats, not detected musical sections.'] } }
}

export function validateMusicReview(track, cue, bytes) {
  if (cue.audioSha256 !== audioHash(bytes)) throw Error('Cue audio hash does not match the exact recording.')
  if (!['en', 'hi', 'instrumental', 'other'].includes(track.language) || cue.language !== track.language) throw Error('Track/cue language is missing or inconsistent.')
  if (cue.review?.status !== 'approved' || cue.review.timingApproved !== true || cue.review.rightsApproved !== true || !cue.review.reviewer || !cue.review.reviewedAt || !Number.isFinite(Date.parse(cue.review.reviewedAt))) throw Error('Track requires recorded human timing and rights approval.')
  validateBeats(cue.beatsMs, cue.durationMs)
  if (!Number.isFinite(cue.bpm) || cue.bpm <= 0) throw Error('Invalid tempo summary.')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [input, id, language, output, flag, correctionFile] = process.argv.slice(2)
    if (!input || !id || !language || !output || (flag && (flag !== '--beats' || !correctionFile)) || process.argv.length > 8) throw Error('Usage: pnpm music:analyze <recording.wav> <track-id> <en|hi|instrumental|other> <private-draft.json> [--beats <beats.json>]')
    const out = resolve(realpathSync(dirname(resolve(output))), resolve(output).split(/[\\/]/).at(-1))
    for (const folder of ['../public/', '../dist/']) {
      const root = fileURLToPath(new URL(folder, import.meta.url)), rel = relative(root, out)
      if (!rel || (!rel.startsWith('..') && !isAbsolute(rel))) throw Error('Write drafts outside public/ and dist/. Use a private working folder.')
    }
    if (statSync(input).size > 100_000_000) throw Error('Recording exceeds the 100 MB analysis limit.')
    const draft = createDraft(readFileSync(input), id, language, correctionFile ? JSON.parse(readFileSync(correctionFile, 'utf8')) : undefined)
    writeFileSync(out, JSON.stringify(draft, null, 2) + '\n', { flag: 'wx' })
    console.log(`Draft: ${draft.beatsMs.length} beats, ${draft.events.length} actions, ${draft.bpm} BPM. Review required; nothing published.`)
  } catch (error) { console.error(error.message); process.exitCode = 1 }
}
