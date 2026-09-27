import type { CueMap, FightEvent } from '../types'
import { TECHNIQUES } from '../game/techniques'

// Playback-only analysis: actual transients guide a tempo estimate, then each beat
// follows nearby onsets. This is intentionally separate from reviewed authored cues.
export function analyzeEnergy(energy: number[], hopMs: number, trackId: string, durationMs: number): CueMap {
  if (!energy.length || !Number.isFinite(hopMs) || hopMs <= 0 || !Number.isFinite(durationMs) || durationMs <= 0 || energy.some(x => !Number.isFinite(x) || x < 0)) throw Error('Audio analysis received invalid samples.')
  const onset = energy.map((x, i) => Math.max(0, x - (energy[i - 1] ?? 0)))
  let period = 60000 / 120 / hopMs, bestScore = 0
  for (let lag = Math.ceil(60000 / 180 / hopMs); lag <= Math.floor(60000 / 65 / hopMs); lag++) {
    let sum = 0, left = 0, right = 0
    for (let i = lag; i < onset.length; i++) { sum += onset[i] * onset[i - lag]; left += onset[i] ** 2; right += onset[i - lag] ** 2 }
    const score = sum / Math.max(1e-12, Math.sqrt(left * right))
    if (score > bestScore + 0.0001) { bestScore = score; period = lag }
  }
  let phase = 0, phaseScore = -1
  for (let p = 0; p < period; p++) {
    let score = 0
    for (let i = p; i < onset.length; i += period) score += onset[Math.round(i)] ?? 0
    if (score > phaseScore) { phase = p; phaseScore = score }
  }
  const beatsMs: number[] = [], strengths: number[] = []
  const reference = Math.max(0.0001, [...energy].sort((a, b) => a - b)[Math.floor(energy.length * 0.9)])
  const basePeriod = period
  let previous = -period
  for (let predicted = phase; predicted * hopMs < durationMs;) {
    let at = Math.round(predicted), score = 0
    const radius = Math.round(period * 0.2)
    for (let j = Math.max(0, at - radius); j <= Math.min(onset.length - 1, at + radius); j++) {
      const weighted = onset[j] * (1 - Math.abs(j - predicted) / (radius + 1))
      if (weighted > score) { score = weighted; at = j }
    }
    const time = Math.round(at * hopMs)
    if (time >= durationMs) break
    if (!beatsMs.length || time > beatsMs[beatsMs.length - 1]) {
      beatsMs.push(time)
      let peak = 0
      for (let j = Math.max(0, at - 3); j < Math.min(energy.length, at + 15); j++) peak = Math.max(peak, energy[j])
      strengths.push(Math.min(1, peak / reference))
    }
    if (previous >= 0 && score > 0) period = Math.max(basePeriod * 0.8, Math.min(basePeriod * 1.2, period * 0.9 + (at - previous) * 0.1))
    previous = at
    predicted = at + period
  }
  const events: FightEvent[] = []
  let readyAt = 350, move = 0
  for (let i = 0; i < beatsMs.length; i++) {
    const atMs = beatsMs[i]
    if (atMs < readyAt || atMs > durationMs - 1500 || strengths[i] < 0.12) continue
    const technique = strengths[i] < 0.45 ? undefined : TECHNIQUES[move++ % TECHNIQUES.length]
    const kind = technique?.kind ?? 'dodge'
    events.push({ id: `${trackId}-${i}`, atMs, kind, ...(technique ? { technique: technique.id } : {}), actorId: 'hero', targetId: `enemy-${Math.floor(i / 16) % 3 + 1}` })
    readyAt = atMs + (kind === 'dodge' ? 1600 : ['launch', 'finisher'].includes(kind) ? 1250 : 800)
  }
  return { schemaVersion: 1, trackId, bpm: Math.round(60000 / (basePeriod * hopMs)), durationMs, beatsMs, phrasesMs: beatsMs.filter((_, i) => i % 16 === 0), events }
}

export async function analyzeAudio(buffer: AudioBuffer, trackId: string, signal: AbortSignal): Promise<CueMap> {
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i))
  const hop = Math.max(1, Math.round(buffer.sampleRate / 100)), energy: number[] = []
  for (let start = 0; start < buffer.length; start += hop) {
    if (energy.length % 256 === 0) {
      await new Promise<void>(resolve => setTimeout(resolve, 0))
      signal.throwIfAborted()
    }
    let sum = 0, count = 0
    for (let i = start; i < Math.min(buffer.length, start + hop); i += 2) {
      for (const channel of channels) { sum += channel[i] * channel[i]; count++ }
    }
    energy.push(Math.sqrt(sum / Math.max(1, count)))
  }
  signal.throwIfAborted()
  return analyzeEnergy(energy, hop / buffer.sampleRate * 1000, trackId, Math.round(buffer.duration * 1000))
}
