import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright-Konfiguration für die KjG-Hygieneschulung E2E-Tests.
 *
 * Der webServer-Block startet das Backend (das auch das gebuildete Frontend
 * unter `/` ausliefert) auf Port 3098. Tests laufen nur in Chromium-Mobile.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'line' : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3098',
    trace: 'retain-on-failure',
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command:
      'cd .. && npm run build && cd backend && PORT=3098 ' +
      "COOKIE_SECRET='e2etest-32-byte-secret-aaaaaaaaaaaaaaa' " +
      "ADMIN_PASSWORD_HASH=\"$(node -e \"console.log(require('bcryptjs').hashSync('e2eAdminPass',4))\")\" " +
      'DB_PATH=./data/e2e.sqlite npx tsx src/server.ts',
    url: 'http://127.0.0.1:3098/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
