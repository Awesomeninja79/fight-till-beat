import { afterEach, expect, it, vi } from 'vitest'
import { AudioEngine } from './AudioEngine'

afterEach(() => vi.unstubAllGlobals())

function setup() {
  const sources: { start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }[] = []
  class FakeContext {
    state = 'running'; currentTime = 0; destination = {}
    createGain() { return { gain: { value: 1 }, connect: vi.fn() } }
    createBufferSource() { const source = { start: vi.fn(), stop: vi.fn(), connect: vi.fn(), buffer: null, onended: null }; sources.push(source); return source }
    decodeAudioData = vi.fn(async () => ({ duration: 60 }))
  }
  vi.stubGlobal('AudioContext', FakeContext)
  const pending = new Map<string, (response: unknown) => void>()
  vi.stubGlobal('fetch', vi.fn((url: string) => new Promise(resolve => pending.set(url, resolve))))
  const finish = (url: string) => pending.get(url)!({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) })
  return { engine: new AudioEngine(), sources, pending, finish }
}

it('only starts the newest preview when downloads finish out of order', async () => {
  const { engine, sources, pending, finish } = setup()
  const first = engine.play('/first.wav')
  await vi.waitFor(() => expect(pending.has('/first.wav')).toBe(true))
  const second = engine.play('/second.wav')
  await vi.waitFor(() => expect(pending.has('/second.wav')).toBe(true))
  finish('/second.wav'); expect(await second).toBe(true)
  finish('/first.wav'); expect(await first).toBe(false)
  expect(sources).toHaveLength(1)
  expect(sources[0].start).toHaveBeenCalledOnce()
  expect(sources[0].stop).not.toHaveBeenCalled()
})

it('does not start a canceled download, and resume restores its saved offset', async () => {
  const { engine, sources, pending, finish } = setup()
  const canceled = engine.play('/cancel.wav')
  await vi.waitFor(() => expect(pending.size).toBe(1))
  engine.stop(); finish('/cancel.wav')
  expect(await canceled).toBe(false)
  expect(sources).toHaveLength(0)
  const playing = engine.play('/active.wav', 12)
  await vi.waitFor(() => expect(pending.has('/active.wav')).toBe(true))
  finish('/active.wav'); await playing
  engine.pause()
  expect(await engine.resume()).toBe(true)
  expect(sources[1].start).toHaveBeenCalledWith(0.05, 12)
})
