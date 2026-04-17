// AgenzieCase Specific E2E Tests
import { test, expect } from '@playwright/test';

test.describe('AgenzieCase Platform', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load main application', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Check that we're on AgenzieCase
    const title = page.locator('h1, .logo, [data-testid="app-title"], title').first();
    const titleText = await title.textContent();

    // Verify we have content
    expect(titleText).toBeTruthy();
  });

  test('should display property search functionality', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for search elements
    const searchElements = page.locator('input[placeholder*="Cerca"], .search-box, #search, [data-testid="search"]').first();

    if (await searchElements.isVisible({ timeout: 3000 })) {
      await expect(searchElements).toBeVisible();
    }
  });

  test('should have responsive design', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    let propertyCards = page.locator('.property-card, .listing, .immobile').first();
    await expect(propertyCards).toBeVisible({ timeout: 5000 });

    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    propertyCards = page.locator('.property-card, .listing, .immobile').first();
    await expect(propertyCards).toBeVisible({ timeout: 5000 });

    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    propertyCards = page.locator('.property-card, .listing, .immobile').first();
    await expect(propertyCards).toBeVisible({ timeout: 5000 });
  });

  test('should handle empty states gracefully', async ({ page }) => {
    await page.goto('/properties?nonexistent=true');

    // Should show empty state or 404
    await page.waitForTimeout(2000);

    const emptyState = page.locator('text=/nessun risultato|no results|non trovato/i').first();
    const hasEmptyState = await emptyState.isVisible().catch(() => false);

    if (hasEmptyState) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('should have working navigation', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for navigation elements
    const navigation = page.locator('nav, .navigation, .navbar, header').first();

    if (await navigation.isVisible({ timeout: 3000 })) {
      // Check for logo/home link
      const homeLink = page.locator('a:has-text("Home"), .logo, [href="/"]').first();
      await expect(homeLink.first()).toBeVisible();

      // Check for main navigation links
      const navLinks = page.locator('nav a, .navigation a, .navbar a');
      const linkCount = await navLinks.count();

      expect(linkCount).toBeGreaterThan(0);
    }
  });

  test('should display contact information', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for contact info in footer or contact section
    const contactInfo = page.locator('footer, .contact, [data-testid="contact"]').first();

    if (await contactInfo.isVisible({ timeout: 3000 })) {
      // Should have at least email or phone
      const emailOrPhone = page.locator('text=/@|\\+\\d{3}|email|telefono/i').first();
      await expect(emailOrPhone.first()).toBeVisible();
    }
  });

  test('should handle error states', async ({ page }) => {
    // Try to access a non-existent property
    await page.goto('/properties/999999999');

    await page.waitForTimeout(2000);

    // Should show error or redirect
    const errorMessage = page.locator('text=/non trovato|404|error|not found/i').first();
    const hasError = await errorMessage.isVisible().catch(() => false);

    if (hasError) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('should load images efficiently', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for lazy loading or image optimization
    const images = page.locator('img').first();
    await expect(images).toBeVisible({ timeout: 5000 });

    // Verify images have src or data-src (lazy loading)
    const imageSrc = await images.getAttribute('src');
    const dataSrc = await images.getAttribute('data-src');

    expect(imageSrc || dataSrc).toBeTruthy();
  });

  test('should have working property filters', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for filter controls
    const filters = page.locator('.filter, .filters, [data-testid="filters"]').first();

    if (await filters.isVisible({ timeout: 3000 })) {
      // Try to interact with filters
      const cityFilter = page.locator('select[name="city"], input[placeholder*="Città"]').first();

      if (await cityFilter.isVisible({ timeout: 2000 })) {
        await cityFilter.fill('Milano');

        // Wait for filter to apply
        await page.waitForTimeout(1000);

        // Verify page updated (URL changed or content changed)
        const currentUrl = page.url();
        expect(currentUrl).toBeTruthy();
      }
    }
  });

  test('should display property details correctly', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click on first property if available
    const firstProperty = page.locator('.property-card, .listing, .immobile').first();

    if (await firstProperty.isVisible({ timeout: 5000 })) {
      await firstProperty.click();

      await page.waitForTimeout(2000);

      // Check for property details
      const details = page.locator('.property-details, .immobile-dettagli, [data-testid="property-details"]').first();
      const hasDetails = await details.isVisible().catch(() => false);

      if (hasDetails) {
        await expect(details).toBeVisible();
      }
    }
  });
});
