import { chromium, devices } from '@playwright/test'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const errors = []
const failedUrls = []
page.on('pageerror', error => errors.push(error.message))
page.on('console', message => { if (message.type() === 'error') errors.push(`${message.location().url}: ${message.text()}`) })
page.on('response', response => { if (response.status() >= 400) failedUrls.push(`${response.status()} ${response.url()}`) })
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await page.screenshot({ path: 'test-results/menu.png', fullPage: true })
await page.getByRole('button', { name: 'START THE FIGHT' }).click()
await page.getByText('NOW PLAYING').waitFor({ timeout: 20000 })
await page.waitForTimeout(11000)
await page.screenshot({ path: 'test-results/fight.png', fullPage: true })
console.log(JSON.stringify({ title: await page.title(), errors, failedUrls, canvas: await page.locator('canvas').count(), playing: await page.getByText('NOW PLAYING').count() }, null, 2))
const mobile = await browser.newPage({ ...devices['Pixel 7'] })
await mobile.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' })
await mobile.screenshot({ path: 'test-results/mobile-menu.png', fullPage: true })
await browser.close()
