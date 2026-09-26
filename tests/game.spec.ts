import { expect, test } from '@playwright/test'

test('choose a song, enter the arena, pause, and return to the track list', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /every beat/i })).toBeVisible()
  await page.getByRole('button', { name: 'Select After Hours' }).click()
  await expect(page.getByRole('button', { name: 'Select After Hours' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'START THE FIGHT' }).click()
  await expect(page.getByText('NOW PLAYING')).toBeVisible({ timeout: 20_000 })
  await expect(page.getByText('After Hours', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Pause fight' }).click()
  await expect(page.getByText('INTERMISSION')).toBeVisible()
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
