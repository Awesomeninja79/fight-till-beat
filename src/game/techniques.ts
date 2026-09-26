import catalog from './techniques.json'
import type { FightEvent } from '../types'
export type Technique = {
  id: string; name: string; discipline: string; kind: FightEvent['kind']
  motion: string; side: string; height: number; reach: number; arc: number; turn: number; crouch: number; air: number
}
export const TECHNIQUES = catalog as Technique[]
const byId = new Map(TECHNIQUES.map(technique => [technique.id, technique]))
export const techniqueFor = (event?: FightEvent | null) => event?.technique ? byId.get(event.technique) : undefined
export const isThrow = (technique?: Technique) => technique?.motion === 'throw' || technique?.motion === 'sacrifice'
