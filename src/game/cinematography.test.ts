import { describe, expect, it } from 'vitest'
import { cinematicAt } from './cinematography'
import { strikeTime } from './combat'
import type { CueMap } from '../types'

const cues: CueMap = { schemaVersion: 1, trackId: 'test', bpm: 120, durationMs: 30000, beatsMs: [], phrasesMs: [], events: [
  { id: '1', atMs: 8000, kind: 'punch', actorId: 'hero', targetId: 'enemy-1' },
  { id: '2', atMs: 12000, kind: 'finisher', actorId: 'hero', targetId: 'enemy-2' },
] }
describe('anime direction', () => {
  it('keeps a wider throw shot through the tumble after the attack window ends', () => {
    const throwCues: CueMap = { ...cues, events: [{ ...cues.events[1], technique: 'judo-ogoshi', kind: 'launch' }] }
    const standard = cinematicAt(cues, 12.7, 1.5, false)
    const shot = cinematicAt(throwCues, 12.7, 1.5, false)
    expect(shot.position[2]).toBeGreaterThan(standard.position[2])
    expect(shot.fov).toBeGreaterThan(standard.fov)
  })
  it('keeps the contact sample on the cue and holds it without stopping the music clock', () => {
    expect(strikeTime(0, 0.3)).toBe(0.3)
    expect(strikeTime(0.04, 0.3)).toBe(0.3)
    expect(strikeTime(-0.1, 0.3)).toBeLessThan(0.3)
    expect(strikeTime(0.2, 0.3)).toBeGreaterThan(0.3)
  })
  it('changes cinematic angle and reconstructs the same shot after a seek', () => {
    const shot = cinematicAt(cues, 9, 1.5, false)
    expect(cinematicAt(cues, 15, 1.5, false).position).not.toEqual(shot.position)
    expect(cinematicAt(cues, 9, 1.5, false)).toEqual(shot)
  })
  it('uses a fixed wide camera in reduced motion on both aspect ratios', () => {
    for (const aspect of [0.46, 1.6]) {
      expect(cinematicAt(cues, 8, aspect, true)).toEqual(cinematicAt(cues, 12, aspect, true))
      expect(cinematicAt(cues, 8, aspect, true).roll).toBe(0)
    }
  })
  it('keeps camera shots finite and outside the character space for the full sequence', () => {
    for (const aspect of [0.46, 1.6]) for (let t = 0; t < 30; t += 0.05) {
      const shot = cinematicAt(cues, t, aspect, false)
      expect([...shot.position, ...shot.target, shot.fov, shot.roll].every(Number.isFinite)).toBe(true)
      expect(shot.position[2] - shot.target[2]).toBeGreaterThan(4)
      expect(shot.fov).toBeGreaterThan(30)
    }
  })
})
