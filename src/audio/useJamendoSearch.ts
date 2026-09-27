import { useCallback, useEffect, useRef, useState } from 'react'

export type JamendoTrack = { id: string; title: string; artist: string; durationSec: number; url: string; audio: string; licenseUrl: string }
type Result = JamendoTrack
type SearchState = { key: string; tracks: Result[]; nextOffset: number | null; error: string; busy: boolean; searched: boolean }
const empty = { key: '', tracks: [], nextOffset: null, error: '', busy: false, searched: false }

export function useJamendoSearch(query: string, language: string, enabled: boolean) {
  const normalizedQuery = query.trim()
  const key = JSON.stringify([normalizedQuery, language])
  const eligible = enabled && language !== 'other' && (normalizedQuery.length >= 2 || language !== 'all')
  const [state, setState] = useState<SearchState>(empty)
  const request = useRef<AbortController | null>(null)
  const activeKey = useRef('')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (offset = 0) => {
    if (!eligible) return
    if (timer.current) clearTimeout(timer.current)
    const identity = `${key}:${offset}`
    if (activeKey.current === identity && !request.current?.signal.aborted) return
    request.current?.abort()
    const controller = new AbortController(); request.current = controller; activeKey.current = identity
    // Returning from a fight refreshes the same search. Keep its selectable rows
    // visible so a background refresh cannot invalidate a click on Start.
    setState(previous => ({ key, tracks: previous.key === key ? previous.tracks : [], nextOffset: null, error: '', busy: true, searched: false }))
    try {
      const params = new URLSearchParams({ q: normalizedQuery, language, offset: String(offset) })
      const response = await fetch(`/api/jamendo?${params}`, { signal: controller.signal })
      const data = await response.json()
      if (!response.ok) throw Error(data.error || 'Music search is unavailable. Please try again.')
      if (!Array.isArray(data.tracks)) throw Error('Music search returned an invalid response.')
      if (controller.signal.aborted) return
      setState(previous => ({ key, tracks: offset ? [...previous.tracks, ...data.tracks.filter((track: Result) => !previous.tracks.some(p => p.id === track.id))] : data.tracks, nextOffset: data.nextOffset ?? null, error: '', busy: false, searched: true }))
    } catch (reason) {
      if (!controller.signal.aborted) setState(previous => ({ ...previous, busy: false, nextOffset: offset || null, searched: true, error: reason instanceof Error ? reason.message : 'Music search is unavailable. Please try again.' }))
    } finally { if (request.current === controller) activeKey.current = '' }
  }, [eligible, key, normalizedQuery, language])

  useEffect(() => {
    if (eligible) timer.current = setTimeout(() => void search(), 500)
    return () => { if (timer.current) clearTimeout(timer.current); request.current?.abort() }
  }, [eligible, search])

  const current = eligible && state.key === key ? state : empty
  return { ...current, pending: eligible && (!current.searched || current.busy), eligible, search }
}
