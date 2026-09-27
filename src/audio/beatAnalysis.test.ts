import { expect, it } from 'vitest'
import { analyzeAudio, analyzeEnergy } from './beatAnalysis'
import { validateCueMap } from '../game/timeline'

it('finds an offset 120 BPM pulse and produces valid fights with recovery gaps', () => {
  const energy = Array.from({ length: 3200 }, (_, i) => i >= 23 && (i - 23) % 50 < 4 ? 0.8 : 0.001)
  const map = validateCueMap(analyzeEnergy(energy, 10, 'pulse', 32000), 'pulse')
  expect(map.bpm).toBe(120)
  expect(map.beatsMs.slice(0, 4)).toEqual([230, 730, 1230, 1730])
  expect(map.events.length).toBeGreaterThan(12)
  map.events.slice(1).forEach((event, i) => expect(event.atMs - map.events[i].atMs).toBeGreaterThanOrEqual(['launch', 'finisher'].includes(map.events[i].kind) ? 1250 : 800))
})

it('leaves silent passages empty and handles beatless recordings without failing playback', () => {
  const silence = analyzeEnergy(new Array(2000).fill(0), 10, 'silent', 20000)
  expect(silence.events).toEqual([])
  expect(silence.beatsMs.length).toBeGreaterThan(0)
  const energy = Array.from({ length: 4000 }, (_, i) => i < 2000 && i % 50 < 5 ? 1 : 0)
  expect(analyzeEnergy(energy, 10, 'quiet', 40000).events.every(e => e.atMs < 20200)).toBe(true)
  expect(() => analyzeEnergy([NaN], 10, 'bad', 1000)).toThrow('invalid samples')
})

it('analyzes opposite-phase stereo energy and allows cancellation between chunks', async () => {
  const sampleRate = 8000, length = sampleRate * 10
  const left = Float32Array.from({ length }, (_, i) => i % 4000 < 200 ? 0.8 : 0)
  const right = left.map(x => -x)
  const buffer = { sampleRate, length, duration: 10, numberOfChannels: 2, getChannelData: (i: number) => i ? right : left } as AudioBuffer
  const map = await analyzeAudio(buffer, 'stereo', new AbortController().signal)
  expect(map.bpm).toBe(120)
  expect(map.events.length).toBeGreaterThan(0)
  const controller = new AbortController()
  const pending = analyzeAudio(buffer, 'cancel', controller.signal)
  controller.abort()
  await expect(pending).rejects.toThrow()
})
