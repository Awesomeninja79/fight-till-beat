import type { CueMap, FightEvent } from '../types'

export function validateCueMap(value: unknown, trackId: string): CueMap {
  if (!value || typeof value !== 'object') throw new Error('Cue map is missing.')
  const cue = value as CueMap
  if (cue.schemaVersion !== 1 || cue.trackId !== trackId) throw new Error('Cue map version or track does not match.')
  if (!Number.isFinite(cue.durationMs) || cue.durationMs <= 0) throw new Error('Cue map duration is invalid.')
  if (!Array.isArray(cue.beatsMs) || !Array.isArray(cue.events) || !Array.isArray(cue.phrasesMs)) throw new Error('Cue map fields are missing.')
  const validTime = (time: number) => Number.isFinite(time) && time >= 0 && time <= cue.durationMs
  if (!cue.beatsMs.every(validTime) || !cue.phrasesMs.every(validTime) || !cue.events.every(e => validTime(e.atMs))) throw new Error('Cue map has an out-of-range time.')
  if (!cue.beatsMs.every((time, index) => index === 0 || time > cue.beatsMs[index - 1])) throw new Error('Beat times are not sorted.')
  if (!cue.events.every((event, index) => index === 0 || event.atMs >= cue.events[index - 1].atMs)) throw new Error('Fight events are not sorted.')
  if (new Set(cue.events.map(e => e.id)).size !== cue.events.length) throw new Error('Fight event IDs are duplicated.')
  return cue
}

export function closestBeatIndex(beats: number[], timeMs: number) {
  if (beats.length === 0) return -1
  let low = 0
  let high = beats.length - 1
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (beats[mid] < timeMs) low = mid + 1
    else high = mid
  }
  if (low > 0 && Math.abs(beats[low - 1] - timeMs) < Math.abs(beats[low] - timeMs)) return low - 1
  return low
}

export function activeEvent(events: FightEvent[], timeMs: number, windowMs = 520): FightEvent | null {
  let low = 0
  let high = events.length
  while (low < high) {
    const mid = Math.floor((low + high) / 2)
    if (events[mid].atMs <= timeMs) low = mid + 1
    else high = mid
  }
  const event = events[low - 1]
  return event && timeMs - event.atMs <= windowMs ? event : null
}

export function comboAt(events: FightEvent[], timeMs: number) {
  let combo = 0
  for (const event of events) {
    if (event.atMs > timeMs) break
    if (event.kind === 'punch' || event.kind === 'kick' || event.kind === 'launch' || event.kind === 'finisher') combo++
  }
  return combo
}
