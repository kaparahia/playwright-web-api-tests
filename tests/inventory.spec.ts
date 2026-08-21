import { test, expect } from '../fixtures/fixtures';
import { users, products } from '../utils/test-data';

test.describe('Inventory (products page)', () => {
  // Log in before every test: a typical beforeEach hook.
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login(users.standard.username, users.standard.password);
  });

  test('6 products are displayed on the page', async ({ inventoryPage }) => {
    // Count check: one of the most common validations for lists.
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
  });

  test('sorting from A to Z', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('az');
    const names = await inventoryPage.getProductNames();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));

    expect(names).toEqual(sorted);
  });

  test('sorting from Z to A', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');
    const names = await inventoryPage.getProductNames();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));

    expect(names).toEqual(sorted);
  });

  test('sorting by price: from low to high', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.getProductPrices();
    const sorted = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(sorted);
  });

  test('adding a product to the cart updates the counter', async ({ inventoryPage }) => {
    // The cart badge is not displayed before adding an item.
    await expect(inventoryPage.cartBadge).toBeHidden();

    await inventoryPage.addProductToCart(products.backpack);

    await expect(inventoryPage.cartBadge).toBeVisible();
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('adding multiple products increases the cart counter', async ({ inventoryPage }) => {
    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.addProductToCart(products.bikeLight);
    await inventoryPage.addProductToCart(products.onesie);

    expect(await inventoryPage.getCartItemsCount()).toBe(3);
  });

  test('removing a product removes it from the cart', async ({ inventoryPage }) => {
    await inventoryPage.addProductToCart(products.backpack);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.removeProductFromCart(products.backpack);
    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  test('logout returns to the login page', async ({ inventoryPage, page }) => {
    await inventoryPage.logout();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });
});
