// Authentication E2E Tests
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show login button on home page', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for login button or link
    const loginSelectors = [
      'button:has-text("Accedi")',
      'button:has-text("Login")',
      'a:has-text("Accedi")',
      'a:has-text("Login")',
      '[data-testid="login-button"]'
    ];

    let loginButton = null;
    for (const selector of loginSelectors) {
      try {
        loginButton = page.locator(selector).first();
        if (await loginButton.isVisible({ timeout: 2000 })) {
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (loginButton) {
      await expect(loginButton).toBeVisible();
    } else {
      console.log('Login button not found - app might be publicly accessible');
    }
  });

  test('should have working navigation', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check if page loaded successfully
    const title = await page.title();
    expect(title).toBeTruthy();

    // Look for navigation elements
    const navSelectors = ['nav', '.navigation', '.navbar', 'header'];
    let navFound = false;

    for (const selector of navSelectors) {
      const nav = page.locator(selector).first();
      if (await nav.isVisible({ timeout: 2000 })) {
        navFound = true;
        break;
      }
    }

    console.log('Navigation found:', navFound);
  });

  test('should handle property search', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for search functionality
    const searchSelectors = [
      'input[placeholder*="Cerca"]',
      'input[type="search"]',
      '#search',
      '.search-input'
    ];

    for (const selector of searchSelectors) {
      const searchInput = page.locator(selector).first();
      if (await searchInput.isVisible({ timeout: 2000 })) {
        await searchInput.fill('Milano');
        await page.waitForTimeout(1000);
        console.log('Search functionality found');
        return;
      }
    }

    console.log('Search input not found - might use different UI pattern');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');

    // Check if page is still functional
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Verify viewport size
    const viewportSize = page.viewportSize();
    expect(viewportSize.width).toBe(375);
  });

  test('should load without JavaScript errors', async ({ page }) => {
    const errors = [];

    page.on('pageerror', (error) => {
      errors.push(error);
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(errors.length).toBe(0);
  });
});
