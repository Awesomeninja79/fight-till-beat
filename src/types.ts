export type Track = {
  id: string
  title: string
  artist: string
  bpm: number
  durationSec: number
  mood: string
  colors: [string, string]
  audio: string
  cues: string
  rightsId: string
}

export type FightEvent = {
  id: string
  atMs: number
  kind: 'punch' | 'kick' | 'dodge' | 'dance' | 'launch' | 'finisher' | 'step'
  actorId: 'hero'
  targetId: string
}

export type CueMap = {
  schemaVersion: number
  trackId: string
  bpm: number
  durationMs: number
  beatsMs: number[]
  phrasesMs: number[]
  events: FightEvent[]
}

export type Phase = 'menu' | 'loading' | 'playing' | 'paused' | 'finished' | 'error'
export type Quality = 'low' | 'high'
