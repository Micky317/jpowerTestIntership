import { test, expect } from '@playwright/test';

// Test muy simple para aprender: carga la URL base (usa BASE_URL de .env si existe)
// y comprueba que la página tiene título (no vacío).
test('smoke - carga la página principal y tiene título', async ({ page }) => {
  const url = process.env.BASE_URL || 'https://example.com';
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  const title = await page.title();
  expect(title).not.toBe('');
});
