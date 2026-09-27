import { expect, test } from '@playwright/test'

test('one debounced search combines local and Jamendo songs and resets to three originals', async ({ page }) => {
  const requests: string[] = []
  await page.route('**/api/jamendo?**', route => {
    requests.push(route.request().url())
    const url = new URL(route.request().url())
    return route.fulfill({ json: { tracks: url.searchParams.get('language') === 'hi' ? [] : [{ id: '12', title: 'Afterglow fixture', artist: 'Fixture artist', durationSec: 125, url: 'https://www.jamendo.com/track/12', audio: 'https://prod-1.storage.jamendo.com/?trackid=12', licenseUrl: 'https://creativecommons.org/licenses/by-nc-nd/3.0/' }], nextOffset: null } })
  })
  await page.goto('/')
  await expect(page.locator('.track-card')).toHaveCount(3, { timeout: 15000 })
  await expect(page.getByRole('group', { name: 'Music source' })).toHaveCount(0)
  expect(requests).toHaveLength(0)
  await page.getByLabel('SEARCH MUSIC').pressSequentially('after', { delay: 35 })
  await expect(page.getByText('Afterglow fixture')).toBeVisible()
  expect(requests).toHaveLength(1)
  expect(new URL(requests[0]).searchParams.get('q')).toBe('after')
  await expect(page.locator('.track-list .track-card')).toHaveCount(2)
  await expect(page.getByRole('button', { name: 'Select After Hours' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Fixture artist · Jamendo' })).toHaveAttribute('href', 'https://www.jamendo.com/track/12')
  await page.getByRole('button', { name: 'Select Afterglow fixture' }).click()
  await expect(page.getByRole('button', { name: 'Select Afterglow fixture' })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('button', { name: 'START THE FIGHT' })).toBeEnabled()
  await page.getByLabel('LANGUAGE', { exact: true }).selectOption('hi')
  await expect(page.getByText('No matching tracks yet.')).toBeVisible()
  expect(new URL(requests[1]).searchParams.get('language')).toBe('hi')
  await page.getByRole('button', { name: 'RESET SEARCH' }).click()
  await expect(page.locator('.track-card')).toHaveCount(3)
  await expect(page.getByRole('button', { name: 'START THE FIGHT' })).toBeEnabled()
  await expect(page.getByText('Lean On', { exact: true })).toHaveCount(0)
})

test('provider errors preserve local results and support manual retry', async ({ page }) => {
  let attempts = 0
  await page.route('**/api/jamendo?**', route => route.fulfill(++attempts === 1 ? { status: 503, json: { error: 'Jamendo search is not configured on this server yet.' } } : { json: { tracks: [], nextOffset: null } }))
  await page.goto('/')
  await page.getByLabel('SEARCH MUSIC').fill('after')
  await expect(page.getByRole('alert')).toContainText('not configured')
  await expect(page.getByRole('button', { name: 'Select After Hours' })).toBeVisible()
  await page.getByRole('button', { name: 'RETRY SEARCH' }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.locator('.track-card')).toHaveCount(1)
})

test('a delayed earlier query cannot replace newer results and pagination avoids duplicates', async ({ page }) => {
  let releaseOld: (() => Promise<void>) | undefined
  await page.route('**/api/jamendo?**', async route => {
    const url = new URL(route.request().url())
    if (url.searchParams.get('q') === 'old') {
      await new Promise<void>(resolve => { releaseOld = async () => { try { await route.fulfill({ json: { tracks: [{ id: '1', title: 'Stale result', artist: 'Fixture', durationSec: 100, url: 'https://www.jamendo.com/track/1' }], nextOffset: null } }) } finally { resolve() } } })
      return
    }
    const base = { id: '2', title: 'New result', artist: 'Fixture', durationSec: 100, url: 'https://www.jamendo.com/track/2' }
    const more = url.searchParams.get('offset') === '12'
    await route.fulfill({ json: { tracks: more ? [base, { ...base, id: '3', title: 'Next page' }] : [base], nextOffset: more ? null : 12 } })
  })
  await page.goto('/')
  await page.getByLabel('SEARCH MUSIC').fill('old')
  await expect.poll(() => Boolean(releaseOld)).toBe(true)
  await page.getByLabel('SEARCH MUSIC').fill('new')
  await expect(page.getByText('New result', { exact: true })).toBeVisible()
  await releaseOld!()
  await expect(page.getByText('Stale result')).toHaveCount(0)
  await page.getByRole('button', { name: 'MORE RESULTS' }).click()
  await expect(page.getByText('Next page', { exact: true })).toBeVisible()
  await expect(page.locator('.jamendo-track')).toHaveCount(2)
})
