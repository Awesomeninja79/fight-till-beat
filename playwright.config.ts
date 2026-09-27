import { defineConfig, devices } from '@playwright/test'

const previewPort = process.env.PLAYWRIGHT_PORT ?? '5173'
const previewUrl = `http://127.0.0.1:${previewPort}`

export default defineConfig({
  testDir: './tests',
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: previewUrl, trace: 'on-first-retry' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], channel: process.env.CI ? undefined : 'chrome' } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'], channel: process.env.CI ? undefined : 'chrome' } },
  ],
  webServer: {
    command: `pnpm dev --port ${previewPort} --strictPort`,
    url: previewUrl,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
