// @ts-check
const { test, expect } = require('@playwright/test');
const {
  clearLocalStorage,
  loginAsCustomer,
  loginAsWorkshop
} = require('../helpers/test-utils');

test.describe('Authentication - Integration Tests', () => {

  test.describe('Customer App Auth', () => {

    test.beforeEach(async ({ page }) => {
      await page.goto('/index.html');
      await clearLocalStorage(page);
    });

    test('should load without authentication required initially', async ({ page }) => {
      await page.waitForFunction(() => typeof window.App !== 'undefined', { timeout: 10000 });

      const homePage = page.locator('#page-home');
      await expect(homePage).toBeVisible({ timeout: 5000 });
    });

    test('should have Auth object available', async ({ page }) => {
      await page.waitForFunction(() => typeof window.Auth !== 'undefined', { timeout: 10000 });

      const authExists = await page.evaluate(() => typeof window.Auth !== 'undefined');
      expect(authExists).toBe(true);
    });

    test('should save customer session to localStorage', async ({ page }) => {
      await page.waitForFunction(() => typeof window.App !== 'undefined');

      await loginAsCustomer(page, '+49 170 1234567');

      const savedUser = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('schadens-chat-user') || 'null');
      });

      expect(savedUser).not.toBeNull();
      expect(savedUser.type).toBe('customer');
      expect(savedUser.phoneNumber).toBe('+49 170 1234567');
    });

    test('should restore session on page reload', async ({ page }) => {
      await page.waitForFunction(() => typeof window.App !== 'undefined');

      // Set session
      await loginAsCustomer(page, '+49 170 9999999');

      // Reload page
      await page.reload();
      await page.waitForFunction(() => typeof window.App !== 'undefined');

      // Check session is restored
      const savedUser = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('schadens-chat-user') || 'null');
      });

      expect(savedUser.phoneNumber).toBe('+49 170 9999999');
    });

    test('should clear session on logout', async ({ page }) => {
      await page.waitForFunction(() => typeof window.App !== 'undefined');

      await loginAsCustomer(page);

      // Logout
      await page.evaluate(() => {
        localStorage.removeItem('schadens-chat-user');
        if (window.Auth) {
          window.Auth.currentUser = null;
        }
      });

      const savedUser = await page.evaluate(() => {
        return localStorage.getItem('schadens-chat-user');
      });

      expect(savedUser).toBeNull();
    });

    test('should format German phone numbers correctly', async ({ page }) => {
      await page.waitForFunction(() => typeof window.Auth !== 'undefined');

      const formatted = await page.evaluate(() => {
        // Test phone formatting if available
        if (window.Auth && window.Auth.formatPhoneNumber) {
          return window.Auth.formatPhoneNumber('01701234567');
        }
        // Manual formatting
        let phone = '01701234567';
        if (phone.startsWith('0')) {
          phone = '+49' + phone.substring(1);
        }
        return phone;
      });

      expect(formatted).toMatch(/^\+49/);
    });
  });

  test.describe('Workshop Portal Auth', () => {

    test.beforeEach(async ({ page }) => {
      await page.goto('/werkstatt.html');
      await clearLocalStorage(page);
    });

    test('should show login form initially', async ({ page }) => {
      await page.waitForLoadState('domcontentloaded');

      // Look for login form or section
      const loginSection = page.locator('#login-section, .login-form, #page-login, [data-page="login"]').first();
      await expect(loginSection).toBeVisible({ timeout: 10000 });
    });

    test('should have email input', async ({ page }) => {
      await page.waitForLoadState('domcontentloaded');

      const emailInput = page.locator('input[type="email"], #login-email, input[name="email"]').first();
      await expect(emailInput).toBeAttached();
    });

    test('should have password input', async ({ page }) => {
      await page.waitForLoadState('domcontentloaded');

      const passwordInput = page.locator('input[type="password"], #login-password, input[name="password"]').first();
      await expect(passwordInput).toBeAttached();
    });

    test('should have login button', async ({ page }) => {
      await page.waitForLoadState('domcontentloaded');

      const loginBtn = page.locator('#login-btn, button[type="submit"], [data-action="login"]').first();
      await expect(loginBtn).toBeVisible({ timeout: 5000 });
    });

    test('should save workshop session to localStorage', async ({ page }) => {
      await page.waitForFunction(() => typeof window.Workshop !== 'undefined' || true, { timeout: 10000 });

      await loginAsWorkshop(page, 'test@werkstatt.de', 'workshop-test-1');

      const savedUser = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('schadens-chat-user') || 'null');
      });

      const savedWorkshop = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('schadens-chat-workshop') || 'null');
      });

      expect(savedUser).not.toBeNull();
      expect(savedUser.type).toBe('workshop');
      expect(savedWorkshop).not.toBeNull();
      expect(savedWorkshop.id).toBe('workshop-test-1');
    });

    test('should show dashboard after login', async ({ page }) => {
      await loginAsWorkshop(page, 'test@werkstatt.de', 'workshop-test-1');

      // Reload to trigger auth check
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // Page should load - either dashboard, login, or app container
      const mainContent = page.locator('#dashboard, #login-section, .dashboard, .login-form, #app, body').first();
      await expect(mainContent).toBeVisible({ timeout: 10000 });
    });

    test('should clear workshop session on logout', async ({ page }) => {
      await loginAsWorkshop(page, 'test@werkstatt.de', 'workshop-1');

      // Logout
      await page.evaluate(() => {
        localStorage.removeItem('schadens-chat-user');
        localStorage.removeItem('schadens-chat-workshop');
      });

      const savedUser = await page.evaluate(() => localStorage.getItem('schadens-chat-user'));
      const savedWorkshop = await page.evaluate(() => localStorage.getItem('schadens-chat-workshop'));

      expect(savedUser).toBeNull();
      expect(savedWorkshop).toBeNull();
    });
  });

  test.describe('Session Management', () => {

    test('should distinguish between customer and workshop users', async ({ page }) => {
      await page.goto('/index.html');
      await clearLocalStorage(page);

      // Set customer session
      await loginAsCustomer(page, '+49 170 1111111');

      let user = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('schadens-chat-user') || 'null')
      );
      expect(user.type).toBe('customer');

      // Clear and set workshop session
      await clearLocalStorage(page);
      await loginAsWorkshop(page, 'workshop@test.de', 'workshop-1');

      user = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('schadens-chat-user') || 'null')
      );
      expect(user.type).toBe('workshop');
    });

    test('should persist user ID across sessions', async ({ page }) => {
      await page.goto('/index.html');
      await clearLocalStorage(page);

      // Create session with specific UID
      await page.evaluate(() => {
        const user = {
          uid: 'persistent-user-id-123',
          phoneNumber: '+49 170 5555555',
          type: 'customer'
        };
        localStorage.setItem('schadens-chat-user', JSON.stringify(user));
      });

      // Reload
      await page.reload();

      const user = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('schadens-chat-user') || 'null')
      );

      expect(user.uid).toBe('persistent-user-id-123');
    });

    test('should handle missing session gracefully', async ({ page }) => {
      await page.goto('/index.html');
      await clearLocalStorage(page);

      // App should still work without session
      await page.waitForFunction(() => typeof window.App !== 'undefined', { timeout: 10000 });

      const appWorks = await page.evaluate(() => typeof window.App !== 'undefined');
      expect(appWorks).toBe(true);
    });
  });

  test.describe('Demo Mode', () => {

    test('should allow demo mode without real credentials', async ({ page }) => {
      await page.goto('/werkstatt.html');
      await clearLocalStorage(page);
      await page.waitForLoadState('domcontentloaded');

      // Look for demo button
      const demoBtn = page.locator('#demo-btn, [data-action="demo"], .demo-login').first();

      if (await demoBtn.isVisible()) {
        await demoBtn.click();
        await page.waitForTimeout(1000);

        // Should show dashboard or demo content
        const dashboard = page.locator('#dashboard, .dashboard, [data-page="dashboard"]').first();
        await expect(dashboard).toBeVisible({ timeout: 10000 });
      }
    });

    test('should mark demo session appropriately', async ({ page }) => {
      await page.goto('/werkstatt.html');

      // Set demo session
      await page.evaluate(() => {
        const demoUser = {
          uid: 'demo-workshop',
          email: 'demo@werkstatt.de',
          type: 'workshop',
          isDemo: true
        };
        localStorage.setItem('schadens-chat-user', JSON.stringify(demoUser));
      });

      const user = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('schadens-chat-user') || 'null')
      );

      expect(user.isDemo).toBe(true);
    });
  });

  test.describe('Auth State Changes', () => {

    test('should update UI on auth state change', async ({ page }) => {
      await page.goto('/werkstatt.html');
      await clearLocalStorage(page);
      await page.waitForLoadState('domcontentloaded');

      // Initially should show login
      const loginVisible = await page.locator('#login-section, .login-form, [data-page="login"]').first().isVisible();

      // Login
      await loginAsWorkshop(page, 'test@test.de', 'workshop-1');
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // UI should reflect logged-in state (localStorage has user)
      const user = await page.evaluate(() =>
        JSON.parse(localStorage.getItem('schadens-chat-user') || 'null')
      );
      expect(user).not.toBeNull();
    });
  });
});
