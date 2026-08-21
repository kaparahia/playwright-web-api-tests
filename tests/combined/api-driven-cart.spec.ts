import { test, expect } from '../../fixtures/fixtures';
import { users, products } from '../../utils/test-data';
import { Product } from '../../api/types/product.types';
import { assertValidProductSchema } from '../../utils/schema-validators';

/**
 * Combined UI + API test.
 *
 * Important detail: FakeStoreAPI (the public API) and SauceDemo (the UI under
 * test) are independent services with different data. In a real project, the
 * API and UI normally belong to one system: a test might prepare data through
 * the backend API and then verify it in that application's UI.
 * This pattern is shown for learning purposes: the API returns dynamic data
 * that determines the next UI steps, and the same test uses both `apiClient`
 * (request) and page objects (page), which is the technical essence of a
 * combined test.
 */
test.describe('Combined flow: API determines the data for the UI flow', () => {
  test('the product count from the API determines how many items to add in the UI, and the cart reflects it', async ({
    apiClient,
    loginPage,
    inventoryPage,
  }) => {
    // --- Step 1: API ---
    // Retrieve a limited product list from an external service. This simulates,
    // for example, a configuration for how many products to show in a promotion.
    const apiResponse = await apiClient.getAllProducts({ limit: 3 });
    expect(apiResponse.status()).toBe(200);

    const apiProducts: Product[] = await apiResponse.json();
    expect(apiProducts).toHaveLength(3);
    for (const product of apiProducts) {
      assertValidProductSchema(product);
    }

    // --- Step 2: UI ---
    // The product count just confirmed by the API becomes a browser-action
    // parameter: add the same number of items to the SauceDemo cart.
    const availableProducts = [products.backpack, products.bikeLight, products.boltTShirt];
    const productsToAdd = availableProducts.slice(0, apiProducts.length);

    await loginPage.open();
    await loginPage.login(users.standard.username, users.standard.password);

    for (const productName of productsToAdd) {
      await inventoryPage.addProductToCart(productName);
    }

    // --- Step 3: verify the UI result against the API data. ---
    const cartCount = await inventoryPage.getCartItemsCount();
    expect(cartCount).toBe(apiProducts.length);
  });
});
