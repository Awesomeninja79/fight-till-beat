import { expect, it, vi } from 'vitest'
import { searchJamendo, createJamendoHandler, providerLink } from '../../server/jamendo'
import type { IncomingMessage, ServerResponse } from 'node:http'

const payload = { headers: { status: 'success' }, results: [{ id: '12', name: 'Test song', artist_name: 'Test artist', duration: 120, audio: 'https://example.test/private-audio', shareurl: 'javascript:bad()' }] }
it('keeps credentials/media server-side and maps Hindi discovery to the provider', async () => {
  const provider = vi.fn<typeof fetch>(async () => Response.json(payload))
  const result = await searchJamendo(new URLSearchParams({ q: 'love', language: 'hi' }), 'test-credential', provider)
  const url = provider.mock.calls[0]?.[0] as unknown as URL
  expect(url.hostname).toBe('api.jamendo.com')
  expect(url.searchParams.get('lang')).toBe('hi')
  expect(url.searchParams.has('prolicensing')).toBe(false)
  expect(url.searchParams.get('type')).toBe('single albumtrack')
  expect(result.status).toBe(200)
  expect(result.body.tracks?.[0].url).toBe('https://www.jamendo.com/track/12')
  expect(JSON.stringify(result)).not.toMatch(/test-credential|private-audio|javascript/)
})
it('returns provider streams and licenses without filtering song license types', async () => {
  const result = await searchJamendo(new URLSearchParams('q=rock'), 'test', async () => Response.json({ ...payload, results: [{ ...payload.results[0], audio: 'https://prod-1.storage.jamendo.com/?trackid=12&format=mp31', license_ccurl: 'http://creativecommons.org/licenses/by-nc-nd/3.0/' }] }))
  expect(result.body.tracks?.[0].audio).toContain('prod-1.storage.jamendo.com')
  expect(result.body.tracks?.[0].licenseUrl).toBe('https://creativecommons.org/licenses/by-nc-nd/3.0/')
  for (const url of ['https://evil.test/a.mp3', 'javascript:alert(1)', 'https://prod-1.storage.jamendo.com.evil.test/', 'https://prod-1.storage.jamendo.com/?client_id=secret']) expect(providerLink(url, 'audio')).toBe('')
})
it('rejects invalid queries and missing configuration without contacting the provider', async () => {
  const provider = vi.fn()
  for (const query of ['q=x', 'q=rock&language=invalid', 'q=rock&offset=-1', 'q=rock&offset=13', `q=${'a'.repeat(101)}`]) expect((await searchJamendo(new URLSearchParams(query), 'test', provider)).status).toBe(400)
  expect((await searchJamendo(new URLSearchParams('q=rock'), '', provider)).status).toBe(503)
  expect(provider).not.toHaveBeenCalled()
})
it('handles empty results, provider failures and bounded pagination', async () => {
  const query = new URLSearchParams('q=rock')
  expect((await searchJamendo(query, 'test', async () => Response.json({ headers: { status: 'success' }, results: [] }))).body).toEqual({ tracks: [], nextOffset: null })
  expect((await searchJamendo(query, 'test', async () => { throw Error('secret-request-url') })).status).toBe(502)
  expect((await searchJamendo(query, 'test', async () => Response.json({ headers: { status: 'failed', error_message: 'secret' } }))).body.error).not.toContain('secret')
  const provider = async () => Response.json({ ...payload, results: Array.from({ length: 12 }, (_, i) => ({ ...payload.results[0], id: String(i) })) })
  expect((await searchJamendo(query, 'test', provider)).body.nextOffset).toBe(12)
  expect((await searchJamendo(new URLSearchParams('q=rock&offset=120'), 'test', provider)).body.nextOffset).toBeNull()
})
it('rejects writes and throttles requests without storing user identifiers', async () => {
  const provider = vi.fn(async () => Response.json(payload))
  const handler = createJamendoHandler(() => 'test', provider)
  const res = { setHeader: vi.fn(), end: vi.fn(), statusCode: 0 } as unknown as ServerResponse
  await handler({ method: 'POST', url: '/api/jamendo?q=rock' } as IncomingMessage, res)
  expect(res.statusCode).toBe(405)
  for (let i = 0; i < 31; i++) await handler({ method: 'GET', url: '/api/jamendo?q=rock' } as IncomingMessage, res)
  expect(res.statusCode).toBe(429)
  expect(provider).toHaveBeenCalledTimes(30)
  expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store')
})

it('coalesces concurrent identical requests without caching completed results', async () => {
  let release!: (value: Response) => void
  const provider = vi.fn(() => new Promise<Response>(resolve => { release = resolve }))
  const handler = createJamendoHandler(() => 'test', provider)
  const response = () => ({ setHeader: vi.fn(), end: vi.fn(), statusCode: 0 }) as unknown as ServerResponse
  const req = { method: 'GET', url: '/api/jamendo?q=rock' } as IncomingMessage
  const first = handler(req, response()), second = handler(req, response())
  expect(provider).toHaveBeenCalledTimes(1)
  release(Response.json(payload)); await Promise.all([first, second])
  const third = handler(req, response())
  expect(provider).toHaveBeenCalledTimes(2)
  release(Response.json(payload)); await third
})
