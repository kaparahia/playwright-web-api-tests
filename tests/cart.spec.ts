import { test, expect } from '../fixtures/fixtures';
import { users, products } from '../utils/test-data';

test.describe('Cart (shopping cart)', () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginPage.open();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.addProductToCart(products.bikeLight);
  });

  test('products added on inventory appear in the cart', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.openCart();

    const names = await cartPage.getCartItemNames();
    expect(names).toContain(products.backpack);
    expect(names).toContain(products.bikeLight);
    expect(await cartPage.getCartItemsCount()).toBe(2);
  });

  test('removing an item from the cart decreases the quantity', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.openCart();
    await cartPage.removeItem(products.backpack);

    expect(await cartPage.getCartItemsCount()).toBe(1);
    const names = await cartPage.getCartItemNames();
    expect(names).not.toContain(products.backpack);
  });

  test('the "Continue Shopping" button returns to the products page', async ({ inventoryPage, cartPage, page }) => {
    await inventoryPage.openCart();
    await cartPage.continueShoppingButton.click();

    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('the Checkout button leads to the checkout form', async ({ inventoryPage, cartPage, page }) => {
    await inventoryPage.openCart();
    await cartPage.proceedToCheckout();

    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });
});
