import type { FightEvent } from '../types'

export const ENEMY_POSITIONS: [number, number][] = [[1.75, 0.05], [3.35, 1.35], [0.7, -2.65]]
export const isAttack = (event: FightEvent) => ['punch', 'kick', 'launch', 'finisher'].includes(event.kind)
const smooth = (value: number) => { const x = Math.max(0, Math.min(1, value)); return x * x * (3 - 2 * x) }

export function waitingOffset(x: number, z: number, heroX: number, heroZ: number, time: number): [number, number] {
  const dx = x - (heroX + 1.12), dz = z - (heroZ - .05)
  const distance = Math.hypot(dx, dz)
  const weight = smooth((distance - .3) / .8) * (1 - smooth((distance - 2) / 3)) * smooth(time / 2)
  return [Math.sign(dx) * 2.1 * weight, Math.sign(dz) * .45 * weight]
}

export function combatAt(events: FightEvent[], ms: number) {
  const actions = events.filter(e => e.kind !== 'step')
  let next = actions.findIndex(e => e.atMs > ms)
  if (next === -1) next = actions.length
  const previous = actions[next - 1]
  const upcoming = actions[next]
  const event = upcoming && upcoming.atMs - ms <= 320 ? upcoming
    : previous && ms - previous.atMs <= 460 ? previous : null
  const position = (e: FightEvent | undefined): [number, number] => e
    ? ENEMY_POSITIONS[Number(e.targetId.slice(-1)) - 1] ?? ENEMY_POSITIONS[0] : [0.3, 0.6]
  const from = position(previous)
  const to = position(upcoming ?? previous)
  const start = previous ? previous.atMs + 460 : 0
  const end = upcoming ? upcoming.atMs - 320 : start
  const dashStart = Math.max(start, end - 650)
  const travel = end > dashStart ? smooth((ms - dashStart) / (end - dashStart)) : 0
  return {
    event,
    age: event ? (ms - event.atMs) / 1000 : 10,
    x: from[0] + (to[0] - from[0]) * travel - 1.12,
    z: from[1] + (to[1] - from[1]) * travel + 0.05,
    moving: travel > 0 && travel < 1 && (from[0] !== to[0] || from[1] !== to[1]),
    travel,
    target: position(event ?? upcoming ?? previous),
    heading: Math.atan2(to[0] - from[0], to[1] - from[1]),
  }
}

export function moveEnvelope(age: number) {
  // Hold the anticipation, release explosively, then briefly hold contact.
  return age < 0 ? smooth((age + 0.13) / 0.13) : 1 - smooth((age - 0.045) / 0.415)
}

export function strikeTime(age: number, contact: number) {
  if (age < -0.12) return contact * 0.22 * smooth((age + 0.32) / 0.2)
  if (age < 0) return contact * (0.22 + 0.78 * smooth((age + 0.12) / 0.12))
  if (age < 0.045) return contact
  return contact + (age - 0.045) * 1.55
}

export function attackLayersAt(events: FightEvent[], ms: number) {
  const layers = events.filter(isAttack).filter(e => ms >= e.atMs - 320 && ms <= e.atMs + 460).map(event => {
    const age = (ms - event.atMs) / 1000
    return { event, age, weight: smooth((age + .32) / .18) * (1 - smooth((age - .09) / .37)) }
  })
  const total = layers.reduce((sum, layer) => sum + layer.weight, 0)
  return layers.map(layer => ({ ...layer, weight: layer.weight / Math.max(1, total) }))
}
