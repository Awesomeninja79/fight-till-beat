import type { IncomingMessage, ServerResponse } from 'node:http'

type TrackResult = { id: string; title: string; artist: string; durationSec: number; url: string; audio: string; licenseUrl: string }
// Provider metadata is untrusted. Only expose HTTPS playback and license links on known hosts.
export function providerLink(value: unknown, kind: 'audio' | 'license') {
  if (typeof value !== 'string') return ''
  try {
    const url = new URL(value)
    const allowed = kind === 'audio' ? /^(?:prod-\d+\.storage|mp3l)\.jamendo\.com$/.test(url.hostname) : url.hostname === 'creativecommons.org'
    if (!allowed || !['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port) return ''
    url.protocol = 'https:'
    if (url.searchParams.has('client_id') || url.searchParams.has('client_secret')) return ''
    return url.toString()
  } catch { return '' }
}
type SearchReply = { status: number; body: { error?: string; tracks?: TrackResult[]; nextOffset?: number | null } }
const PAGE_SIZE = 12

export async function searchJamendo(params: URLSearchParams, clientId: string, fetcher: typeof fetch = fetch): Promise<SearchReply> {
  const query = (params.get('q') ?? '').trim()
  const language = params.get('language') ?? 'all'
  const offsetText = params.get('offset') ?? '0'
  if (query.length > 100 || (query.length < 2 && language === 'all') || !['all', 'en', 'hi', 'instrumental'].includes(language) || !/^\d{1,3}$/.test(offsetText) || Number(offsetText) > 120 || Number(offsetText) % PAGE_SIZE !== 0) {
    return { status: 400, body: { error: 'Enter 2–100 characters or choose a language, and use a valid results page.' } }
  }
  if (!clientId) return { status: 503, body: { error: 'Jamendo search is not configured on this server yet.' } }
  const offset = Number(offsetText)
  const url = new URL('https://api.jamendo.com/v3.0/tracks/')
  url.search = new URLSearchParams({ client_id: clientId, format: 'json', limit: String(PAGE_SIZE), offset: String(offset), type: 'single albumtrack', audioformat: 'mp31', include: 'licenses', ...(query ? { search: query } : {}) }).toString()
  if (language === 'instrumental') url.searchParams.set('vocalinstrumental', 'instrumental')
  else if (language !== 'all') url.searchParams.set('lang', language)
  try {
    const response = await fetcher(url, { signal: AbortSignal.timeout(8000), redirect: 'error' })
    if (!response.ok) return { status: response.status === 429 ? 429 : 502, body: { error: response.status === 429 ? 'Jamendo is busy. Please wait a minute and try again.' : 'Jamendo could not be reached. Please try again.' } }
    const data = await response.json()
    if (data?.headers?.status !== 'success' || !Array.isArray(data.results)) return { status: 502, body: { error: 'Jamendo could not complete the search. Check the application configuration or try again later.' } }
    const tracks: TrackResult[] = data.results.slice(0, PAGE_SIZE).flatMap((item: Record<string, unknown>) => {
      const id = String(item?.id ?? '')
      if (!/^\d+$/.test(id) || typeof item.name !== 'string' || typeof item.artist_name !== 'string') return []
      return [{ id, title: item.name.slice(0, 200), artist: item.artist_name.slice(0, 200), durationSec: typeof item.duration === 'number' && Number.isFinite(item.duration) && item.duration > 0 ? item.duration : 0, url: `https://www.jamendo.com/track/${id}`, audio: providerLink(item.audio, 'audio'), licenseUrl: providerLink(item.license_ccurl, 'license') }]
    })
    return { status: 200, body: { tracks, nextOffset: data.results.length === PAGE_SIZE && offset < 120 ? offset + PAGE_SIZE : null } }
  } catch {
    // Never reflect provider errors or request URLs: they may contain credentials.
    return { status: 502, body: { error: 'Jamendo search timed out or returned an invalid response. Please try again.' } }
  }
}

export function createJamendoHandler(getClientId: () => string, fetcher: typeof fetch = fetch) {
  let windowStart = 0, requests = 0
  const inFlight = new Map<string, Promise<SearchReply>>()
  return async (req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET'); res.statusCode = 405
      res.end(JSON.stringify({ error: 'Use GET for music search.' })); return
    }
    const now = Date.now()
    if (now - windowStart >= 60000) { windowStart = now; requests = 0 }
    if (++requests > 30) {
      res.setHeader('Retry-After', '60'); res.statusCode = 429
      res.end(JSON.stringify({ error: 'Too many searches. Please wait a minute.' })); return
    }
    const params = new URL(req.url ?? '/', 'http://localhost').searchParams
    const key = JSON.stringify([(params.get('q') ?? '').trim(), params.get('language') ?? 'all', params.get('offset') ?? '0'])
    let pending = inFlight.get(key)
    if (!pending) {
      pending = searchJamendo(params, getClientId(), fetcher).finally(() => inFlight.delete(key))
      inFlight.set(key, pending)
    }
    const result = await pending
    res.statusCode = result.status
    res.end(JSON.stringify(result.body))
  }
}
