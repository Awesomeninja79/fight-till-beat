import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { createDraft, decodeWav, validateMusicReview, generateEvents, beatStrengths } from './music-pipeline.mjs'

function clicks({ silent = false, stereo = false } = {}) {
  const rate = 8000, channels = stereo ? 2 : 1, frames = rate * 12
  const bytes = Buffer.alloc(44 + frames * channels * 2)
  bytes.write('RIFF'); bytes.writeUInt32LE(bytes.length - 8, 4); bytes.write('WAVEfmt ', 8)
  bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(channels, 22)
  bytes.writeUInt32LE(rate, 24); bytes.writeUInt32LE(rate * channels * 2, 28)
  bytes.writeUInt16LE(channels * 2, 32); bytes.writeUInt16LE(16, 34)
  bytes.write('data', 36); bytes.writeUInt32LE(bytes.length - 44, 40)
  for (let i = 0; i < frames; i++) for (let c = 0; c < channels; c++) bytes.writeInt16LE(!silent && i % 4000 < 80 ? (c ? -20000 : 20000) : 0, 44 + (i * channels + c) * 2)
  return bytes
}

test('detects 120 BPM clicks including opposite-phase stereo and produces draft-only cues', () => {
  for (const stereo of [false, true]) {
    const draft = createDraft(clicks({ stereo }), 'test-song', 'hi')
    assert.equal(draft.bpm, 120)
    assert.equal(draft.review.status, 'draft')
    assert.ok(draft.beatsMs.every(t => t % 500 === 0))
    assert.ok(draft.events.every(e => draft.beatsMs.includes(e.atMs)))
    assert.equal(draft.events.at(-1).kind, 'finisher')
  }
})
test('rejects silence, corrupt WAV and malformed corrections', () => {
  assert.throws(() => createDraft(clicks({ silent: true }), 'test', 'en'), /transients/)
  assert.throws(() => decodeWav(clicks().subarray(0, 60)), /RIFF/)
  for (const beats of [[0, 500], [0, 500, 500, 1500, 2000, 2500, 3000, 3500], [0, 500, 1000, 1500, 2000, 2500, 3000, 12000]]) assert.throws(() => createDraft(clicks(), 'test', 'en', beats), /timestamps/)
})
test('manual beats support changing tempo and preserve full recovery', () => {
  const beats = Array.from({ length: 100 }, (_, i) => i < 50 ? i * 400 : 20000 + (i - 50) * 600)
  const events = generateEvents('variable', beats, 50000)
  for (let i = 1; i < events.length; i++) assert.ok(events[i].atMs - events[i - 1].atMs >= (['launch', 'finisher'].includes(events[i - 1].kind) ? 1250 : 800))
  const manual = createDraft(clicks(), 'manual', 'en', beats.filter(t => t < 12000))
  assert.equal(manual.analysis.method, 'manual-beats')
})
test('publication requires review and binds cues to exact audio bytes', () => {
  const bytes = clicks(), draft = createDraft(bytes, 'test', 'en'), track = { language: 'en' }
  assert.throws(() => validateMusicReview(track, draft, bytes), /approval/)
  draft.review = { status: 'approved', timingApproved: true, rightsApproved: true, reviewer: 'test-fixture', reviewedAt: '2026-09-26' }
  validateMusicReview(track, draft, bytes)
  assert.throws(() => validateMusicReview(track, draft, clicks({ stereo: true })), /hash/)
  assert.throws(() => validateMusicReview({ language: 'hi' }, draft, bytes), /language/)
})

test('quiet passages leave rests and dodges; energetic passages drive attacks', () => {
  const beats = Array.from({ length: 60 }, (_, i) => i * 500)
  const audio = { hopMs: 10, energy: Array.from({ length: 3000 }, (_, i) => i < 500 || i >= 2500 ? 0 : i < 1500 ? 0.15 : 0.8) }
  const strengths = beatStrengths(audio, beats)
  const events = generateEvents('dynamic-song', beats, 30000, strengths)
  assert.ok(events.every(e => e.atMs >= 5000 && e.atMs <= 25000))
  const quiet = events.filter(e => e.atMs >= 5500 && e.atMs < 14500)
  assert.ok(quiet.length > 0 && quiet.every(e => e.kind === 'dodge'))
  assert.ok(events.some(e => e.atMs >= 15000 && e.technique))
  assert.ok(events.some(e => e.kind === 'finisher'))
  assert.deepEqual(generateEvents('dynamic-song', beats, 30000, strengths), events)
  assert.throws(() => generateEvents('bad', beats, 30000, [NaN]), /strengths/)
})
test('current original recordings can be analyzed without publishing assets', () => {
  for (const id of ['neon-strike', 'after-hours', 'laser-rush']) {
    const manifest = JSON.parse(readFileSync(new URL('../public/content/tracks.json', import.meta.url)))
    const track = manifest.find(t => t.id === id)
    const bytes = readFileSync(new URL('../public' + track.audio, import.meta.url))
    const draft = createDraft(bytes, id, 'instrumental')
    assert.ok(draft.events.length > 10)
    // Legacy manifest durations are rounded to two decimal places.
    assert.ok(Math.abs(draft.durationMs - track.durationSec * 1000) <= 5)
  }
})

test('reads a WAV with a padded metadata chunk before the format', () => {
  const original = clicks(), metadata = Buffer.alloc(12)
  metadata.write('JUNK'); metadata.writeUInt32LE(3, 4)
  const bytes = Buffer.concat([original.subarray(0, 12), metadata, original.subarray(12)])
  bytes.writeUInt32LE(bytes.length - 8, 4)
  assert.equal(decodeWav(bytes).durationMs, 12000)
})

test('CLI writes a draft, refuses overwrites and blocks public output', t => {
  const temporaryRoot = resolve(tmpdir()), folder = mkdtempSync(join(temporaryRoot, 'ftb-music-test-'))
  t.after(() => {
    if (dirname(resolve(folder)) !== temporaryRoot) throw Error('Unexpected temporary directory.')
    rmSync(folder, { recursive: true, force: true })
  })
  const input = join(folder, 'clicks.wav'), output = join(folder, 'draft.json')
  writeFileSync(input, clicks())
  const script = fileURLToPath(new URL('./music-pipeline.mjs', import.meta.url))
  const run = destination => spawnSync(process.execPath, [script, input, 'click-test', 'hi', destination], { encoding: 'utf8' })
  assert.equal(run(output).status, 0)
  const saved = readFileSync(output, 'utf8')
  assert.equal(JSON.parse(saved).review.status, 'draft')
  assert.equal(run(output).status, 1)
  assert.equal(readFileSync(output, 'utf8'), saved)
  const blocked = run(fileURLToPath(new URL('../public/blocked-draft.json', import.meta.url)))
  assert.equal(blocked.status, 1)
  assert.match(blocked.stderr, /outside public/)
})
