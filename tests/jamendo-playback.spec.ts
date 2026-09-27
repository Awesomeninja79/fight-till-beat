import { expect, test } from '@playwright/test'

const song = { id: '42', title: 'Rhythm fixture', artist: 'Test performer', durationSec: 8, url: 'https://www.jamendo.com/track/42', audio: 'https://prod-1.storage.jamendo.com/?trackid=42&format=mp31', licenseUrl: 'https://creativecommons.org/licenses/by-nc-nd/3.0/' }
function clicks() {
  const rate = 8000, frames = rate * 8, bytes = Buffer.alloc(44 + frames * 2)
  bytes.write('RIFF'); bytes.writeUInt32LE(bytes.length - 8, 4); bytes.write('WAVEfmt ', 8); bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22); bytes.writeUInt32LE(rate, 24); bytes.writeUInt32LE(rate * 2, 28); bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34); bytes.write('data', 36); bytes.writeUInt32LE(frames * 2, 40)
  for (let i = 0; i < frames; i++) bytes.writeInt16LE(i % 4000 < 240 ? Math.round(Math.sin(i * 0.35) * 20000) : 0, 44 + i * 2)
  return bytes
}
test.beforeEach(async ({ page }) => {
  await page.route('**/api/jamendo?**', route => route.fulfill({ json: { tracks: [song], nextOffset: null } }))
})

test('Jamendo preview, analyzed fight, pause/resume, ending and replay use the selected recording', async ({ page }) => {
  test.setTimeout(90_000)
  let loads = 0
  await page.route('https://prod-1.storage.jamendo.com/**', route => { loads++; return route.fulfill({ contentType: 'audio/wav', body: clicks(), headers: { 'Access-Control-Allow-Origin': '*' } }) })
  await page.goto('/')
  await page.getByLabel('SEARCH MUSIC').fill('rhythm')
  await expect(page.getByRole('button', { name: 'Select Rhythm fixture' })).toBeVisible({ timeout: 15000 })
  expect(loads).toBe(0)
  await page.getByRole('button', { name: 'Preview Rhythm fixture', exact: true }).click()
  await expect.poll(() => loads).toBe(1)
  await page.getByRole('button', { name: 'Stop preview of Rhythm fixture' }).click()
  await page.getByRole('button', { name: 'Select Rhythm fixture' }).click()
  await page.getByRole('button', { name: 'START THE FIGHT' }).click()
  await expect(page.getByText('NOW PLAYING', { exact: true })).toBeVisible({ timeout: 25000 })
  await expect(page.locator('.now-playing')).toContainText('Rhythm fixture')
  await expect(page.locator('.track-bpm')).toContainText('120')
  await expect(page.locator('.now-playing').getByRole('link', { name: 'License' })).toHaveAttribute('href', song.licenseUrl)
  await expect.poll(async () => Number(await page.getByRole('progressbar').getAttribute('aria-valuenow'))).toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Pause fight' }).click()
  const paused = await page.getByRole('progressbar').getAttribute('aria-valuenow')
  await page.waitForTimeout(300)
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', paused!)
  await page.getByRole('button', { name: /^RESUME FIGHT/ }).click()
  await expect(page.getByText('SET COMPLETE', { exact: true })).toBeVisible({ timeout: 15000 })
  await page.getByRole('button', { name: 'RUN IT BACK' }).click()
  await expect(page.getByRole('button', { name: 'Pause fight' })).toBeVisible({ timeout: 15000 })
  await page.getByRole('button', { name: 'Choose another track' }).click()
  await expect(page.getByRole('heading', { name: 'THE TRACKLIST' })).toBeVisible()
})

test('a canceled remote load cannot start later, and failed audio can be retried', async ({ page }) => {
  test.setTimeout(90_000)
  let release: (() => Promise<void>) | undefined
  await page.route('https://prod-1.storage.jamendo.com/**', async route => {
    await new Promise<void>(resolve => { release = async () => { try { await route.fulfill({ contentType: 'audio/wav', body: clicks() }) } catch { /* canceled request */ } finally { resolve() } } })
  })
  await page.goto('/')
  await page.getByLabel('SEARCH MUSIC').fill('rhythm')
  await page.getByRole('button', { name: 'Select Rhythm fixture' }).click()
  await page.getByRole('button', { name: 'START THE FIGHT' }).click()
  await expect.poll(() => Boolean(release)).toBe(true)
  await page.getByRole('button', { name: 'CANCEL', exact: true }).click()
  await release!()
  await expect(page.getByText('NOW PLAYING', { exact: true })).toHaveCount(0)
  await page.unroute('https://prod-1.storage.jamendo.com/**')
  await page.route('https://prod-1.storage.jamendo.com/**', route => route.fulfill({ status: 503, body: 'Unavailable' }))
  await page.getByRole('button', { name: 'START THE FIGHT' }).click()
  await expect(page.getByText('Music could not be loaded (503).').first()).toBeVisible({ timeout: 15000 })
  await page.getByRole('button', { name: 'BACK TO TRACKS' }).click()
  await page.unroute('https://prod-1.storage.jamendo.com/**')
  await page.route('https://prod-1.storage.jamendo.com/**', route => route.fulfill({ contentType: 'audio/wav', body: clicks() }))
  await page.getByRole('button', { name: 'START THE FIGHT' }).click()
  await expect(page.getByText('NOW PLAYING', { exact: true })).toBeVisible({ timeout: 25000 })
})
