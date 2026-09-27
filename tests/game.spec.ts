import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => { await page.route('**/api/jamendo?**', route => route.fulfill({ json: { tracks: [], nextOffset: null } })) })

test('search and language filters reset to originals and prevent hidden selection playback', async ({ page }) => {
  test.slow() // Multiple catalog reflows plus a full-page GPU screenshot exceed 30 seconds on CI runners.
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Select Neon Strike' })).toBeVisible({ timeout: 15_000 })
  await page.getByLabel('SEARCH MUSIC').fill('after hours')
  await expect(page.locator('.track-card')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'START THE FIGHT' })).toBeDisabled()
  await page.getByRole('button', { name: 'Select After Hours' }).click()
  await expect(page.getByRole('button', { name: 'START THE FIGHT' })).toBeEnabled()
  await page.getByLabel('SEARCH MUSIC').fill('')
  await page.getByLabel('LANGUAGE', { exact: true }).selectOption('hi')
  await expect(page.getByText('No matching tracks yet.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'START THE FIGHT' })).toBeDisabled()
  await page.getByLabel('LANGUAGE', { exact: true }).selectOption('en')
  await expect(page.locator('.track-card')).toHaveCount(0)
  await expect(page.locator('.track-card button')).toHaveCount(0)
  await page.getByLabel('SEARCH MUSIC').fill('not in catalog')
  await page.getByRole('button', { name: 'CLEAR FILTERS' }).click()
  await expect(page.locator('.track-card')).toHaveCount(3)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: test.info().outputPath('music-catalog.png'), fullPage: true })
})

test('choose a song, enter the arena, pause, and return to the track list', async ({ page }) => {
  test.slow() // Includes two GPU screenshots; transport assertions keep their own timeouts.
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /every beat/i })).toBeVisible()
  await page.getByRole('button', { name: 'Select After Hours' }).click()
  await expect(page.getByRole('button', { name: 'Select After Hours' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'START THE FIGHT' }).click()
  await expect(page.getByText('NOW PLAYING')).toBeVisible({ timeout: 20_000 })
  await expect(page.getByText('After Hours', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '50 TECHNIQUES' }).click()
  await expect(page.locator('.move-book li')).toHaveCount(50)
  await expect(page.locator('.move-book')).toContainText('Judo-inspired')
  await page.getByRole('button', { name: 'Close', exact: true }).click()
  await expect(page.getByText('INTERMISSION')).toBeVisible()
  await page.waitForTimeout(300)
  const pausedFrame = await page.locator('canvas').screenshot()
  await page.waitForTimeout(250)
  expect((await page.locator('canvas').screenshot()).equals(pausedFrame)).toBe(true)
  await page.getByRole('button', { name: 'CHOOSE ANOTHER TRACK', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'THE TRACKLIST' })).toBeVisible()
})

test('privacy and accessibility controls are reachable', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open settings' }).click()
  await expect(page.getByRole('checkbox', { name: 'REDUCED FLASH' })).toBeChecked()
  await page.getByRole('button', { name: 'Close settings' }).click()
  await page.getByRole('button', { name: 'PRIVACY' }).click()
  await expect(page.getByText('Neeraj Saini')).toBeVisible()
})

test('unavailable Lean On request is hidden and does not request audio', async ({ page }) => {
  const missingAudio: string[] = []
  page.on('request', request => { if (request.url().includes('/audio/lean-on')) missingAudio.push(request.url()) })
  await page.goto('/')
  const entry = page.locator('article').filter({ hasText: 'Lean On' })
  await expect(entry).toHaveCount(0)
  await expect(entry.getByRole('button')).toHaveCount(0)
  expect(missingAudio).toEqual([])
})

test('failed character load blocks playback and Start retries successfully', async ({ page }) => {
  await page.route('**/models/fighter-v1.glb', route => route.abort())
  await page.goto('/')
  await page.getByRole('button', { name: 'START THE FIGHT' }).click()
  await expect(page.getByText('Fighters could not be loaded.', { exact: false }).first()).toBeVisible()
  await expect(page.getByText('NOW PLAYING')).toHaveCount(0)
  await page.unroute('**/models/fighter-v1.glb')
  await page.getByRole('button', { name: 'START THE FIGHT' }).click()
  await expect(page.getByText('NOW PLAYING')).toBeVisible({ timeout: 20_000 })
})
