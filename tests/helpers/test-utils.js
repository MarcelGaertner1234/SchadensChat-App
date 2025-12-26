/**
 * SchadensChat-App - Test Utilities
 * Common helper functions for Playwright tests
 */

/**
 * Wait for the App to be fully initialized
 * @param {import('@playwright/test').Page} page
 * @param {number} timeout - Maximum wait time in ms
 */
async function waitForApp(page, timeout = 10000) {
  await page.waitForFunction(
    () => typeof window.App !== 'undefined' && window.App.initialized === true,
    { timeout }
  );
}

/**
 * Wait for the Workshop portal to be initialized
 * @param {import('@playwright/test').Page} page
 * @param {number} timeout - Maximum wait time in ms
 */
async function waitForWorkshop(page, timeout = 10000) {
  await page.waitForFunction(
    () => typeof window.Workshop !== 'undefined',
    { timeout }
  );
}

/**
 * Wait for Firebase to be initialized
 * @param {import('@playwright/test').Page} page
 * @param {number} timeout - Maximum wait time in ms
 */
async function waitForFirebase(page, timeout = 15000) {
  await page.waitForFunction(
    () => typeof window.FirebaseConfig !== 'undefined' && window.FirebaseConfig.initialized === true,
    { timeout }
  );
}

/**
 * Simulate customer login with phone number
 * @param {import('@playwright/test').Page} page
 * @param {string} phone - Phone number
 */
async function loginAsCustomer(page, phone = '+49 170 1234567') {
  await page.evaluate((phoneNumber) => {
    const user = {
      uid: 'test-customer-' + Date.now(),
      phoneNumber: phoneNumber,
      type: 'customer'
    };
    localStorage.setItem('schadens-chat-user', JSON.stringify(user));
    if (window.Auth) {
      window.Auth.currentUser = user;
    }
  }, phone);
}

/**
 * Simulate workshop login with email
 * @param {import('@playwright/test').Page} page
 * @param {string} email - Workshop email
 * @param {string} workshopId - Workshop ID
 */
async function loginAsWorkshop(page, email = 'test@werkstatt.de', workshopId = 'test-workshop-1') {
  await page.evaluate(({ email, workshopId }) => {
    const user = {
      uid: workshopId,
      email: email,
      type: 'workshop'
    };
    const workshop = {
      id: workshopId,
      name: 'Test Werkstatt',
      email: email,
      phone: '+49 170 9999999',
      address: 'Teststrasse 1, 12345 Teststadt',
      zip: '12345',
      active: true
    };
    localStorage.setItem('schadens-chat-user', JSON.stringify(user));
    localStorage.setItem('schadens-chat-workshop', JSON.stringify(workshop));
    if (window.Auth) {
      window.Auth.currentUser = user;
    }
  }, { email, workshopId });
}

/**
 * Clear all localStorage data
 * @param {import('@playwright/test').Page} page
 */
async function clearLocalStorage(page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

/**
 * Set mock photos for testing
 * @param {import('@playwright/test').Page} page
 * @param {number} count - Number of photos to add
 */
async function setMockPhotos(page, count = 1) {
  await page.evaluate((photoCount) => {
    if (!window.App) return;
    window.App.photos = [];
    for (let i = 0; i < photoCount; i++) {
      window.App.photos.push({
        id: `test-photo-${i}`,
        data: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k=',
        file: new File([''], `test-photo-${i}.jpg`, { type: 'image/jpeg' })
      });
    }
  }, count);
}

/**
 * Set mock request data for testing
 * @param {import('@playwright/test').Page} page
 * @param {object} overrides - Override default values
 */
async function setMockRequestData(page, overrides = {}) {
  const defaultRequest = {
    damageType: 'dent',
    damageLocation: 'fenderFrontLeft',
    description: 'Test damage description',
    vehicle: {
      plate: 'TEST-123',
      brand: 'BMW',
      model: 'X5',
      year: '2020',
      color: 'black'
    },
    location: {
      lat: 49.0,
      lng: 8.0,
      address: 'Teststrasse 1, 12345 Teststadt',
      zip: '12345',
      radius: 25
    },
    contact: {
      name: 'Test Kunde',
      phone: '+49 170 1234567',
      email: 'test@kunde.de'
    }
  };

  await page.evaluate(({ defaultData, customData }) => {
    if (!window.App) return;
    window.App.request = { ...defaultData, ...customData };
  }, { defaultData: defaultRequest, customData: overrides });
}

/**
 * Wait for toast notification to appear
 * @param {import('@playwright/test').Page} page
 * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
 * @param {number} timeout - Maximum wait time
 */
async function waitForToast(page, type = null, timeout = 5000) {
  const selector = type ? `.toast.${type}` : '.toast';
  await page.waitForSelector(selector, { state: 'visible', timeout });
}

/**
 * Dismiss all visible toasts
 * @param {import('@playwright/test').Page} page
 */
async function dismissToasts(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.toast').forEach(toast => toast.remove());
  });
}

/**
 * Navigate to a specific page in the App wizard
 * @param {import('@playwright/test').Page} page
 * @param {string} pageName - Page name: 'home', 'photo', 'damage', 'vehicle', 'location', 'contact', 'success'
 */
async function navigateToPage(page, pageName) {
  // Normalize page names (the app uses 'photo' not 'photos')
  const normalizedName = pageName === 'photos' ? 'photo' : pageName;

  await page.evaluate((name) => {
    if (window.App && window.App.navigateTo) {
      window.App.navigateTo(name);
    }
  }, normalizedName);
  await page.waitForTimeout(300); // Wait for animation
}

/**
 * Get current page name from the App
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<string>} Current page name
 */
async function getCurrentPage(page) {
  return await page.evaluate(() => {
    return window.App?.currentPage || null;
  });
}

/**
 * Check if an element exists and is visible
 * @param {import('@playwright/test').Page} page
 * @param {string} selector - CSS selector
 * @returns {Promise<boolean>}
 */
async function isVisible(page, selector) {
  const element = page.locator(selector);
  return await element.isVisible();
}

/**
 * Get text content from all matching elements
 * @param {import('@playwright/test').Page} page
 * @param {string} selector - CSS selector
 * @returns {Promise<string[]>}
 */
async function getTextContents(page, selector) {
  return await page.locator(selector).allTextContents();
}

/**
 * Create a mock subscription for testing
 * @param {import('@playwright/test').Page} page
 * @param {string} plan - Plan type: 'trial', 'starter', 'professional', 'enterprise'
 * @param {string} workshopId - Workshop ID
 */
async function setMockSubscription(page, plan = 'professional', workshopId = 'test-workshop-1') {
  const subscriptions = {
    trial: { plan: 'trial', requestLimit: 999, requestsUsed: 0 },
    starter: { plan: 'starter', requestLimit: 20, requestsUsed: 0 },
    professional: { plan: 'professional', requestLimit: 100, requestsUsed: 0 },
    enterprise: { plan: 'enterprise', requestLimit: -1, requestsUsed: 0 }
  };

  await page.evaluate(({ sub, wid }) => {
    const subscription = {
      ...sub,
      workshopId: wid,
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    localStorage.setItem(`schadens-chat-subscription-${wid}`, JSON.stringify(subscription));
  }, { sub: subscriptions[plan], wid: workshopId });
}

/**
 * Wait for network idle (no pending requests)
 * @param {import('@playwright/test').Page} page
 * @param {number} timeout - Maximum wait time
 */
async function waitForNetworkIdle(page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Take a screenshot with timestamp
 * @param {import('@playwright/test').Page} page
 * @param {string} name - Screenshot name
 */
async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ path: `playwright-report/screenshots/${name}-${timestamp}.png` });
}

module.exports = {
  waitForApp,
  waitForWorkshop,
  waitForFirebase,
  loginAsCustomer,
  loginAsWorkshop,
  clearLocalStorage,
  setMockPhotos,
  setMockRequestData,
  waitForToast,
  dismissToasts,
  navigateToPage,
  getCurrentPage,
  isVisible,
  getTextContents,
  setMockSubscription,
  waitForNetworkIdle,
  takeScreenshot
};
