import { describe, expect, it } from 'vitest'
import { activeEvent, closestBeatIndex, comboAt, validateCueMap } from './timeline'
import type { CueMap } from '../types'

const map: CueMap = {
  schemaVersion: 1,
  trackId: 'test',
  bpm: 120,
  durationMs: 2000,
  beatsMs: [0, 500, 1000, 1500],
  phrasesMs: [0],
  events: [
    { id: 'a', atMs: 500, kind: 'punch', actorId: 'hero', targetId: 'enemy-1' },
    { id: 'b', atMs: 1000, kind: 'dodge', actorId: 'hero', targetId: 'enemy-1' },
    { id: 'c', atMs: 1500, kind: 'kick', actorId: 'hero', targetId: 'enemy-2' },
  ],
}

describe('authored fight timeline', () => {
  it('finds the nearest beat and active move without changing the source data', () => {
    expect(closestBeatIndex(map.beatsMs, 770)).toBe(2)
    expect(activeEvent(map.events, 560)?.id).toBe('a')
    expect(activeEvent(map.events, 20)).toBeNull()
  })
  it('reconstructs combo from song time after a pause or seek', () => {
    expect(comboAt(map.events, 1300)).toBe(1)
    expect(comboAt(map.events, 1800)).toBe(2)
    expect(comboAt(map.events, 1300)).toBe(1)
  })
  it('rejects maps that could desynchronize or replay ambiguous events', () => {
    expect(validateCueMap(map, 'test')).toBe(map)
    expect(() => validateCueMap({ ...map, trackId: 'wrong' }, 'test')).toThrow()
    expect(() => validateCueMap({ ...map, beatsMs: [500, 0] }, 'test')).toThrow()
    expect(() => validateCueMap({ ...map, events: [map.events[0], map.events[0]] }, 'test')).toThrow()
  })
})
