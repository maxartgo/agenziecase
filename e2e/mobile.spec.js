// Mobile E2E Tests
import { test, expect } from '@playwright/test';

test.describe('Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('should be usable on mobile devices', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that mobile menu or navigation is present
    const mobileMenu = page.locator('button[aria-label="Menu"], .hamburger, .mobile-menu-button').first();

    if (await mobileMenu.isVisible({ timeout: 3000 })) {
      await mobileMenu.click();

      // Check for mobile navigation
      const mobileNav = page.locator('.mobile-nav, .sidebar-menu, .offcanvas').first();
      await expect(mobileNav).toBeVisible({ timeout: 2000 });
    }
  });

  test('should display property cards correctly on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that property cards are visible and properly sized
    const propertyCard = page.locator('.property-card, .listing, .immobile').first();
    await expect(propertyCard).toBeVisible({ timeout: 5000 });

    // Verify card fits in viewport
    const box = await propertyCard.boundingBox();
    expect(box.width).toBeLessThanOrEqual(375);
  });

  test('should have touch-friendly buttons on mobile', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check for buttons with adequate touch target size (min 44x44px)
    const buttons = page.locator('button, a[role="button"]').first();

    if (await buttons.isVisible({ timeout: 3000 })) {
      const box = await buttons.boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(40);
      expect(box.width).toBeGreaterThanOrEqual(40);
    }
  });

  test('should handle mobile form input', async ({ page }) => {
    await page.goto('/');

    // Look for search/filter functionality
    const searchInput = page.locator('input[placeholder*="Cerca"], input[type="search"], .search-input').first();

    if (await searchInput.isVisible({ timeout: 3000 })) {
      await searchInput.fill('Villa Milano');

      // Verify mobile keyboard doesn't break layout
      await page.waitForTimeout(1000);

      const searchInputVisible = await searchInput.isVisible();
      expect(searchInputVisible).toBeTruthy();
    }
  });

  test('should work in landscape mode', async ({ page }) => {
    await page.setViewportSize({ width: 667, height: 375 }); // Landscape
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that content is still accessible
    const propertyCard = page.locator('.property-card, .listing, .immobile').first();
    await expect(propertyCard).toBeVisible({ timeout: 5000 });
  });
});
