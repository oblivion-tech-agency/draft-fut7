import { test, expect } from '@playwright/test';

// Smoke test del frontend: no depende del backend (que en CI no se levanta).
test.describe('Homepage', () => {
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Next.js \+ NestJS Boilerplate/);
  });
});
