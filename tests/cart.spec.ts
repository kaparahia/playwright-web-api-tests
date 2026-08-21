import { test, expect } from '../fixtures/fixtures';
import { users, products } from '../utils/test-data';

test.describe('Cart (кошик)', () => {
  test.beforeEach(async ({ loginPage, inventoryPage }) => {
    await loginPage.open();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.addProductToCart(products.bikeLight);
  });

  test('товари, додані на inventory, з\'являються в кошику', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.openCart();

    const names = await cartPage.getCartItemNames();
    expect(names).toContain(products.backpack);
    expect(names).toContain(products.bikeLight);
    expect(await cartPage.getCartItemsCount()).toBe(2);
  });

  test('видалення товару з кошика зменшує кількість позицій', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.openCart();
    await cartPage.removeItem(products.backpack);

    expect(await cartPage.getCartItemsCount()).toBe(1);
    const names = await cartPage.getCartItemNames();
    expect(names).not.toContain(products.backpack);
  });

  test('кнопка "Continue Shopping" повертає на сторінку товарів', async ({ inventoryPage, cartPage, page }) => {
    await inventoryPage.openCart();
    await cartPage.continueShoppingButton.click();

    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('кнопка Checkout веде на форму оформлення замовлення', async ({ inventoryPage, cartPage, page }) => {
    await inventoryPage.openCart();
    await cartPage.proceedToCheckout();

    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });
});
