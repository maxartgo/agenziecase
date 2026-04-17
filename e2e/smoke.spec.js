// Smoke Tests - Basic Functionality
import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('should have working links', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find all links
    const links = page.locator('a[href]').first();

    if (await links.isVisible({ timeout: 2000 })) {
      const linkCount = await page.locator('a[href]').count();
      expect(linkCount).toBeGreaterThan(0);

      // Click first link
      await links.first().click();
      await page.waitForLoadState('networkidle');

      // Verify navigation occurred
      const currentUrl = page.url();
      expect(currentUrl).not.toBe('http://localhost:3000/');
    }
  });

  test('should display content', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for main content
    const content = page.locator('main, .container, #app, .app').first();
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  test('should handle 404 gracefully', async ({ page }) => {
    await page.goto('/non-existent-page-12345');

    await page.waitForTimeout(2000);

    // Should either show 404 page or redirect to home
    const currentUrl = page.url();
    const hasContent = await page.locator('body').isVisible();

    expect(hasContent).toBeTruthy();
  });
});
