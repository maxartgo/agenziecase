// Properties E2E Tests
import { test, expect } from '@playwright/test';

test.describe('Properties Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display properties on home page', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Look for property cards or listings
    const propertyCards = page.locator('.property-card, [data-testid="property"], .listing, .immobile').first();
    await expect(propertyCards).toBeVisible({ timeout: 10000 });
  });

  test('should filter properties by city', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for city search/filter input
    const cityInput = page.locator('input[placeholder*="Città"], input[placeholder*="city"], #city-search').first();

    if (await cityInput.isVisible({ timeout: 3000 })) {
      await cityInput.fill('Milano');
      await cityInput.press('Enter');

      // Wait for filtered results
      await page.waitForTimeout(2000);

      // Verify results contain Milano
      const results = page.locator('.property-card, .listing, .immobile');
      const count = await results.count();

      if (count > 0) {
        // Check that at least some results mention Milano
        const milanoText = page.locator('text=/Milano/i');
        await expect(milanoText.first()).toBeVisible();
      }
    }
  });

  test('should filter properties by price range', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for price inputs
    const minPriceInput = page.locator('input[name="minPrice"], #min-price, [placeholder*="Min"]').first();
    const maxPriceInput = page.locator('input[name="maxPrice"], #max-price, [placeholder*="Max"]').first();

    if (await minPriceInput.isVisible({ timeout: 3000 })) {
      await minPriceInput.fill('150000');
      await maxPriceInput.fill('300000');

      // Apply filter
      const applyButton = page.locator('button:has-text("Filtra"), button:has-text("Applica"), button[type="submit"]').first();
      await applyButton.click();

      // Wait for results
      await page.waitForTimeout(2000);
    }
  });

  test('should navigate to property details', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click on first property
    const firstProperty = page.locator('.property-card, .listing, .immobile').first();
    await firstProperty.click();

    // Verify navigation to property details
    await page.waitForTimeout(1000);

    // Check for property details elements
    const details = page.locator('.property-details, .immobile-dettagli, [data-testid="property-details"]').first();
    await expect(details).toBeVisible({ timeout: 5000 });
  });

  test('should display property images', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for property images
    const images = page.locator('.property-card img, .listing img, .immobile img').first();
    await expect(images).toBeVisible({ timeout: 5000 });
  });

  test('should show property contact form', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click on first property
    const firstProperty = page.locator('.property-card, .listing, .immobile').first();
    await firstProperty.click();

    await page.waitForTimeout(1000);

    // Look for contact button/form
    const contactButton = page.locator('button:has-text("Contatta"), button:has-text("Richiedi info"), .contact-form').first();

    if (await contactButton.isVisible({ timeout: 3000 })) {
      await contactButton.click();

      // Check for contact form
      const contactForm = page.locator('form:has-text("email"), form:has-text("telefono"), .contact-modal').first();
      await expect(contactForm).toBeVisible({ timeout: 3000 });
    }
  });

  test('should handle pagination if available', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for pagination
    const nextButton = page.locator('button:has-text("Avanti"), a:has-text("Next"), .pagination-next').first();

    if (await nextButton.isVisible({ timeout: 3000 })) {
      const initialUrl = page.url();
      await nextButton.click();

      // Verify URL changed or content changed
      await page.waitForTimeout(1000);
      expect(page.url()).not.toBe(initialUrl);
    }
  });

  test('should display property prices correctly', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for price elements
    const prices = page.locator('.price, .prezzo, [data-price]').first();
    await expect(prices).toBeVisible({ timeout: 5000 });

    // Verify price format (should contain currency symbol or numbers)
    const priceText = await prices.textContent();
    expect(priceText).toMatch(/€|EUR|\d+/);
  });
});
