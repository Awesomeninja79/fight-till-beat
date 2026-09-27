import { expect, it } from 'vitest'
import { TECHNIQUES } from './techniques'
import neon from '../../public/content/neon-strike.json'
import after from '../../public/content/after-hours.json'
import laser from '../../public/content/laser-rush.json'

it('ships 50 distinct motion profiles and actually schedules every one', () => {
  expect(TECHNIQUES).toHaveLength(50)
  const profiles = new Set(TECHNIQUES.map(({ id: _id, name: _name, discipline: _discipline, ...motion }) => JSON.stringify(motion)))
  expect(profiles.size).toBe(50)
  const scheduled = new Set([...neon.events, ...after.events, ...laser.events].map(event => 'technique' in event ? event.technique : null))
  expect(TECHNIQUES.every(t => scheduled.has(t.id))).toBe(true)
})

it('leaves enough recovery after a throw or launch', () => {
  for (const cue of [neon, after, laser]) {
    const attacks = cue.events.filter(e => ['punch', 'kick', 'launch', 'finisher'].includes(e.kind))
    for (let i = 0; i < attacks.length - 1; i++) {
      if (['launch', 'finisher'].includes(attacks[i].kind)) expect(attacks[i + 1].atMs - attacks[i].atMs).toBeGreaterThanOrEqual(1250)
    }
  }
})
