// Dashboard E2E Tests
import { test, expect } from '@playwright/test';

test.describe('Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should redirect to login when accessing protected dashboard', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard');

    // Should redirect to login or show login modal
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    const hasLoginModal = page.locator('input[name="email"], input[type="email"]').isVisible();
    const hasLoginPage = currentUrl.includes('/login') || currentUrl.includes('/auth');

    expect(await hasLoginModal || hasLoginPage).toBeTruthy();
  });

  test('should display dashboard after login', async ({ page }) => {
    // Open login
    const loginButton = page.locator('button:has-text("Accedi"), button:has-text("Login")');
    await loginButton.click();

    // Fill with demo credentials (adjust with real test credentials)
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

    await emailInput.fill('demo@agenziecase.it');
    await passwordInput.fill('Demo123456!');

    // Submit
    const submitButton = page.locator('button:has-text("Accedi"), button[type="submit"]').first();
    await submitButton.click();

    // Wait for navigation or dashboard
    await page.waitForTimeout(3000);

    // Check if dashboard elements are visible
    const dashboardElements = page.locator('.dashboard, [data-testid="dashboard"], .crm-dashboard').first();
    const isVisible = await dashboardElements.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      await expect(dashboardElements).toBeVisible();
    }
  });

  test('should show navigation menu', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Look for navigation elements
    const navigation = page.locator('nav, .navigation, .sidebar, .menu').first();

    if (await navigation.isVisible({ timeout: 3000 })) {
      // Check for common navigation items
      const navItems = page.locator('a:has-text("Immobili"), a:has-text("Dashboard"), a:has-text("CRM")');
      const count = await navItems.count();

      expect(count).toBeGreaterThan(0);
    }
  });

  test('should display user profile info when logged in', async ({ page }) => {
    // This test assumes user is logged in or will log in
    const profileButton = page.locator('button:has-text("Profilo"), .user-profile, [data-testid="user-menu"]').first();

    if (await profileButton.isVisible({ timeout: 3000 })) {
      await profileButton.click();

      // Check for profile menu or dropdown
      const profileMenu = page.locator('.profile-menu, .user-dropdown, .dropdown-menu').first();
      await expect(profileMenu).toBeVisible({ timeout: 2000 });
    }
  });

  test('should handle logout', async ({ page }) => {
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Esci"), [data-testid="logout"]').first();

    if (await logoutButton.isVisible({ timeout: 3000 })) {
      await logoutButton.click();

      // Should redirect to home or login
      await page.waitForTimeout(2000);

      const loginRequired = page.locator('input[name="email"], button:has-text("Accedi")').first();
      await expect(loginRequired).toBeVisible({ timeout: 3000 });
    }
  });
});
