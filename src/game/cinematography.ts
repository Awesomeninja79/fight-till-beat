import { combatAt, isAttack } from './combat'
import { isThrow, techniqueFor } from './techniques'
import type { CueMap } from '../types'

const smooth = (v: number) => { const t = Math.max(0, Math.min(1, v)); return t * t * (3 - 2 * t) }
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const shots = [
  { x: -1.1, y: 2.25, z: 6.8, fov: 43, roll: -0.035 },
  { x: 1.4, y: 3.1, z: 6.5, fov: 40, roll: 0.025 },
  { x: -2.4, y: 6.8, z: 7.2, fov: 44, roll: 0 },
  { x: -3.0, y: 2.7, z: 5.8, fov: 46, roll: -0.025 },
]

export function cinematicAt(cues: CueMap | null, time: number, aspect: number, reducedMotion: boolean) {
  const portrait = aspect < 0.8
  if (reducedMotion || !cues) return { position: [1.1, 4.4, portrait ? 17.5 : 11.5] as [number, number, number], target: [1.1, 1.4, -0.5] as [number, number, number], fov: portrait ? 52 : 44, roll: 0 }
  const state = combatAt(cues.events, time * 1000)
  const beat = time * cues.bpm / 60
  const segment = Math.floor(beat / 8)
  const blend = smooth((beat % 8) / 1.6)
  const current = shots[segment % shots.length]
  const previous = shots[(segment + shots.length - 1) % shots.length]
  const centerX = state.x + 0.56
  const centerZ = state.z - 0.025
  const intro = smooth(time / (60 / cues.bpm * 12))
  const heavy = cues.events.find(e => (e.kind === 'launch' || e.kind === 'finisher') && time * 1000 >= e.atMs - 320 && time * 1000 <= e.atMs + 1200)
  const heavyAge = heavy ? time - heavy.atMs / 1000 : 10
  const anticipation = heavyAge < 0 ? smooth((heavyAge + .32) / .32) : 0
  const aerialFrame = heavy ? (heavyAge < 0 ? anticipation : 1 - smooth((heavyAge - .5) / .7)) : 0
  const throwFrame = isThrow(techniqueFor(heavy)) ? aerialFrame : 0
  const contact = state.event && isAttack(state.event) && state.age >= 0 ? (1 - smooth(state.age / 0.22)) : 0
  const shake = contact * Math.sin(state.age * 95) * 0.024
  const z = mix(previous.z, current.z, blend) + (portrait ? 3.8 : 0)
  return {
    position: [
      mix(1.1, centerX + mix(previous.x, current.x, blend), intro) + shake,
      mix(4.4, mix(previous.y, current.y, blend) + aerialFrame * .7 + throwFrame * .8, intro),
      mix(portrait ? 17.5 : 11.5, centerZ + z - contact * .25 + aerialFrame * 1.4 + throwFrame * 1.8, intro),
    ] as [number, number, number],
    target: [mix(1.1, centerX, intro), 1.45 + aerialFrame * .35 - throwFrame * .25, mix(-.5, centerZ + throwFrame * .3, intro)] as [number, number, number],
    fov: (portrait ? 51 : mix(previous.fov, current.fov, blend)) - anticipation * 3 - contact * 2 + throwFrame * 5,
    roll: mix(previous.roll, current.roll, blend) * intro,
  }
}
