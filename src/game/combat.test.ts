import { describe, expect, it } from 'vitest'
import { combatAt, moveEnvelope, waitingOffset } from './combat'
import type { FightEvent } from '../types'

const events: FightEvent[] = [
  { id: 'a', atMs: 1000, kind: 'punch', actorId: 'hero', targetId: 'enemy-1' },
  { id: 'step', atMs: 1200, kind: 'step', actorId: 'hero', targetId: 'enemy-3' },
  { id: 'b', atMs: 3000, kind: 'kick', actorId: 'hero', targetId: 'enemy-2' },
]
describe('sampled combat', () => {
  it('keeps the active target in place while waiting opponents clear the throw lane', () => {
    const state = combatAt(events, 1000)
    expect(waitingOffset(1.75, .05, state.x, state.z, 10)).toEqual([0, 0])
    const offset = waitingOffset(1.75, .05, .7 - 1.12, -2.65 + .05, 10)
    expect(offset[0]).toBeGreaterThan(1)
    expect(waitingOffset(1.75, .05, state.x, state.z, 0)).toEqual([0, 0])
  })
  it('anticipates contact and recovers without a step cue cancelling the move', () => {
    expect(combatAt(events, 679).event).toBeNull()
    expect(combatAt(events, 680).event?.id).toBe('a')
    expect(combatAt(events, 1000).age).toBe(0)
    expect(combatAt(events, 1250).event?.id).toBe('a')
    expect(combatAt(events, 1461).event).toBeNull()
    expect(moveEnvelope(-0.32)).toBe(0)
    expect(moveEnvelope(0)).toBe(1)
    expect(moveEnvelope(0.46)).toBe(0)
  })
  it('holds position through contact, then travels to the next target before wind-up', () => {
    expect(combatAt(events, 1000).x).toBeCloseTo(1.75 - 1.12)
    expect(combatAt(events, 1400).x).toBeCloseTo(1.75 - 1.12)
    expect(combatAt(events, 2200).moving).toBe(true)
    expect(combatAt(events, 2680).x).toBeCloseTo(3.35 - 1.12)
    expect(combatAt(events, 3200).x).toBeCloseTo(3.35 - 1.12)
  })
  it('reconstructs the same pose inputs after pause or a backward seek', () => {
    const before = combatAt(events, 950)
    combatAt(events, 5000)
    expect(combatAt(events, 950)).toEqual(before)
    expect(combatAt([], 0).event).toBeNull()
  })
})
