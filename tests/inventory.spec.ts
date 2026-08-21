import { test, expect } from '../fixtures/fixtures';
import { users, products } from '../utils/test-data';

test.describe('Inventory (сторінка товарів)', () => {
  // Log in before every test: a typical beforeEach hook.
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login(users.standard.username, users.standard.password);
  });

  test('на сторінці відображається 6 товарів', async ({ inventoryPage }) => {
    // Count check: one of the most common validations for lists.
    await expect(inventoryPage.inventoryItems).toHaveCount(6);
  });

  test('сортування від А до Я', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('az');
    const names = await inventoryPage.getProductNames();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));

    expect(names).toEqual(sorted);
  });

  test('сортування від Я до А', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');
    const names = await inventoryPage.getProductNames();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));

    expect(names).toEqual(sorted);
  });

  test('сортування за ціною: від дешевих до дорогих', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.getProductPrices();
    const sorted = [...prices].sort((a, b) => a - b);

    expect(prices).toEqual(sorted);
  });

  test('додавання товару в кошик оновлює лічильник', async ({ inventoryPage }) => {
    // The cart badge is not displayed before adding an item.
    await expect(inventoryPage.cartBadge).toBeHidden();

    await inventoryPage.addProductToCart(products.backpack);

    await expect(inventoryPage.cartBadge).toBeVisible();
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('додавання декількох товарів збільшує лічильник кошика', async ({ inventoryPage }) => {
    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.addProductToCart(products.bikeLight);
    await inventoryPage.addProductToCart(products.onesie);

    expect(await inventoryPage.getCartItemsCount()).toBe(3);
  });

  test('видалення товару прибирає його з кошика', async ({ inventoryPage }) => {
    await inventoryPage.addProductToCart(products.backpack);
    await expect(inventoryPage.cartBadge).toHaveText('1');

    await inventoryPage.removeProductFromCart(products.backpack);
    await expect(inventoryPage.cartBadge).toBeHidden();
  });

  test('logout повертає на сторінку логіну', async ({ inventoryPage, page }) => {
    await inventoryPage.logout();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });
});
