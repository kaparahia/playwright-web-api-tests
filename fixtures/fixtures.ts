import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { FakeStoreApiClient } from '../api/clients/FakeStoreApiClient';

/**
 * Extends Playwright's base `test` with custom fixtures.
 * This avoids creating `new LoginPage(page)` in every test; simply add the
 * required page object or API client to the test parameters.
 * When adding a page or API, register it here once.
 */
type Fixtures = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  apiClient: FakeStoreApiClient;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },

  // apiClient uses a DIFFERENT domain (fakestoreapi.com) from the configured
  // baseURL (saucedemo.com), so it needs a separate request context created
  // through the `playwright` fixture rather than the base `request` fixture.
  apiClient: async ({ playwright }, use) => {
    const requestContext = await playwright.request.newContext({
      baseURL: 'https://fakestoreapi.com',
      extraHTTPHeaders: {
        'Content-Type': 'application/json',
      },
    });
    await use(new FakeStoreApiClient(requestContext));
    await requestContext.dispose();
  },
});

export { expect } from '@playwright/test';
