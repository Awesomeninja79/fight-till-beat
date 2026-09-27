import type { CueMap } from '../types'

export class AudioEngine {
  private context: AudioContext | null = null
  private gain: GainNode | null = null
  private effectsGain: GainNode | null = null
  private source: AudioBufferSourceNode | null = null
  private effectSources: AudioScheduledSourceNode[] = []
  private noiseBuffer: AudioBuffer | null = null
  private buffers = new Map<string, AudioBuffer>()
  private activeUrl: string | null = null
  private startedAt = 0
  private offset = 0
  private volume = 0.8
  private effectsVolume = 0.55
  private muted = false
  private ended: (() => void) | null = null
  private playbackRequest = 0

  private async ensureContext() {
    if (!this.context) {
      this.context = new AudioContext()
      this.gain = this.context.createGain()
      this.gain.connect(this.context.destination)
      this.effectsGain = this.context.createGain()
      this.effectsGain.connect(this.context.destination)
      this.updateGain()
    }
    if (this.context.state === 'suspended') await this.context.resume()
    return this.context
  }

  async unlock() {
    await this.ensureContext()
  }

  private updateGain() {
    if (this.gain) this.gain.gain.value = this.muted ? 0 : this.volume
    if (this.effectsGain) this.effectsGain.gain.value = this.muted ? 0 : this.effectsVolume
  }

  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value))
    this.updateGain()
  }

  setMuted(value: boolean) {
    this.muted = value
    this.updateGain()
  }

  setEffectsVolume(value: number) {
    this.effectsVolume = Math.max(0, Math.min(1, value))
    this.updateGain()
  }

  private stopEffects() {
    for (const source of this.effectSources) {
      try { source.stop() } catch { /* already ended */ }
    }
    this.effectSources = []
  }

  scheduleFightEffects(cues: CueMap) {
    if (!this.context || !this.effectsGain) return
    this.stopEffects()
    const context = this.context
    if (!this.noiseBuffer) {
      const length = Math.floor(context.sampleRate * 0.18)
      const buffer = context.createBuffer(1, length, context.sampleRate)
      const data = buffer.getChannelData(0)
      let seed = 59221
      for (let i = 0; i < length; i++) {
        seed = (seed * 1664525 + 1013904223) >>> 0
        data[i] = (seed / 0xffffffff) * 2 - 1
      }
      this.noiseBuffer = buffer
    }
    for (const event of cues.events) {
      if (!['punch', 'kick', 'launch', 'finisher'].includes(event.kind)) continue
      const at = this.startedAt + event.atMs / 1000 - this.offset
      if (at < context.currentTime + 0.015) continue
      const heavy = event.kind === 'kick' || event.kind === 'finisher'
      const swooshAt = at - 0.13
      if (swooshAt > context.currentTime + 0.015) {
        const swoosh = context.createBufferSource()
        const air = context.createBiquadFilter()
        const envelope = context.createGain()
        swoosh.buffer = this.noiseBuffer
        air.type = 'bandpass'
        air.frequency.setValueAtTime(heavy ? 650 : 1100, swooshAt)
        air.frequency.exponentialRampToValueAtTime(3400, at)
        air.Q.value = 0.7
        envelope.gain.setValueAtTime(0.0001, swooshAt)
        envelope.gain.exponentialRampToValueAtTime(heavy ? 0.075 : 0.045, at - 0.025)
        envelope.gain.exponentialRampToValueAtTime(0.0001, at)
        swoosh.connect(air).connect(envelope).connect(this.effectsGain)
        swoosh.start(swooshAt); swoosh.stop(at)
        this.effectSources.push(swoosh)
      }
      const duration = event.kind === 'finisher' ? 0.24 : heavy ? 0.17 : 0.12
      const osc = context.createOscillator()
      const body = context.createGain()
      osc.type = heavy ? 'sawtooth' : 'triangle'
      osc.frequency.setValueAtTime(heavy ? 150 : 260, at)
      osc.frequency.exponentialRampToValueAtTime(heavy ? 48 : 85, at + duration)
      body.gain.setValueAtTime(0.0001, at)
      body.gain.exponentialRampToValueAtTime(heavy ? 0.20 : 0.13, at + 0.008)
      body.gain.exponentialRampToValueAtTime(0.0001, at + duration)
      osc.connect(body).connect(this.effectsGain)
      osc.start(at)
      osc.stop(at + duration)
      this.effectSources.push(osc)

      const noise = context.createBufferSource()
      const filter = context.createBiquadFilter()
      const snap = context.createGain()
      noise.buffer = this.noiseBuffer
      filter.type = 'highpass'
      filter.frequency.value = heavy ? 800 : 1400
      snap.gain.setValueAtTime(0.0001, at)
      snap.gain.exponentialRampToValueAtTime(heavy ? 0.12 : 0.10, at + 0.004)
      snap.gain.exponentialRampToValueAtTime(0.0001, at + duration * 0.65)
      noise.connect(filter).connect(snap).connect(this.effectsGain)
      noise.start(at)
      noise.stop(at + duration)
      this.effectSources.push(noise)
    }
  }

  async load(url: string) {
    const context = await this.ensureContext()
    const cached = this.buffers.get(url)
    if (cached) return cached
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Music could not be loaded (${response.status}).`)
    const buffer = await context.decodeAudioData(await response.arrayBuffer())
    this.buffers.set(url, buffer)
    return buffer
  }

  async play(url: string, offset = 0, onEnded?: () => void) {
    this.stop()
    const request = this.playbackRequest
    const context = await this.ensureContext()
    const buffer = await this.load(url)
    if (request !== this.playbackRequest) return false
    const source = context.createBufferSource()
    source.buffer = buffer
    source.connect(this.gain!)
    this.source = source
    this.activeUrl = url
    this.offset = offset
    this.startedAt = context.currentTime + 0.05
    this.ended = onEnded ?? null
    source.onended = () => {
      if (this.source !== source) return
      this.source = null
      this.offset = buffer.duration
      this.ended?.()
    }
    source.start(this.startedAt, offset)
    return true
  }

  pause() {
    if (!this.source) return
    this.stopEffects()
    this.offset = this.getTime()
    const source = this.source
    this.source = null
    source.stop()
  }

  async resume(onEnded?: () => void) {
    if (!this.activeUrl) return false
    return this.play(this.activeUrl, this.offset, onEnded)
  }

  stop() {
    this.playbackRequest++
    this.stopEffects()
    if (this.source) {
      const source = this.source
      this.source = null
      source.stop()
    }
    this.offset = 0
    this.activeUrl = null
    this.ended = null
  }

  getTime() {
    if (!this.source || !this.context) return this.offset
    return this.offset + Math.max(0, this.context.currentTime - this.startedAt)
  }

  dispose() {
    this.stop()
    void this.context?.close()
    this.context = null
    this.gain = null
    this.effectsGain = null
    this.noiseBuffer = null
  }
}
