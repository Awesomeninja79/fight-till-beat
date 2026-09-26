export type Track = {
  status?: 'available'
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

export type RequestedTrack = {
  id: string
  title: string
  artist: string
  status: 'audio-required'
  colors: [string, string]
  mood: string
  rightsId: string
  availabilityNote: string
}
export type CatalogTrack = Track | RequestedTrack
export const isPlayableTrack = (track: CatalogTrack): track is Track => track.status !== 'audio-required'

export type FightEvent = {
  technique?: string
  move?: 'jab' | 'cross' | 'hook' | 'roundhouse' | 'side-kick' | 'uppercut' | 'spin-kick'
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
