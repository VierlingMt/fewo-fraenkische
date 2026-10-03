import { defineConfig, devices } from '@playwright/test';

// Getestet wird die gebaute Seite (npm run build) über den Astro-Preview-Server.
const PORT = 4321;

const chrome = devices['Desktop Chrome'];
const mobile = (width: number, height: number) => ({
  ...devices['Pixel 7'],
  viewport: { width, height },
  screen: { width, height },
});

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Smartphones
    { name: 'smartphone-320', use: { ...mobile(320, 568) } }, // iPhone SE (1. Gen.), kleine Androids
    { name: 'smartphone-375', use: { ...mobile(375, 667) } }, // iPhone SE / 8
    { name: 'smartphone-390', use: { ...mobile(390, 844) } }, // iPhone 14/15
    { name: 'smartphone-412', use: { ...mobile(412, 915) } }, // Pixel / Galaxy
    { name: 'smartphone-430', use: { ...mobile(430, 932) } }, // iPhone Pro Max
    // Tablets
    { name: 'tablet-hoch', use: { ...devices['iPad Mini'], browserName: 'chromium' } }, // 768 × 1024
    { name: 'tablet-quer', use: { ...devices['iPad Pro 11 landscape'], browserName: 'chromium' } }, // 1194 × 834
    // Desktop
    { name: 'desktop-1366', use: { ...chrome, viewport: { width: 1366, height: 768 } } },
    { name: 'desktop-1920', use: { ...chrome, viewport: { width: 1920, height: 1080 } } },
  ],
  webServer: {
    command: `npx astro preview --port ${PORT} --host 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
