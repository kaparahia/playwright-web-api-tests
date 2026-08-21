import { test, expect } from '../fixtures/fixtures';
import { users, products, checkoutInfo } from '../utils/test-data';

test.describe('Checkout (order placement)', () => {
  test.beforeEach(async ({ loginPage, inventoryPage, cartPage }) => {
    await loginPage.open();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.addProductToCart(products.fleeceJacket);
    await inventoryPage.openCart();
    await cartPage.proceedToCheckout();
  });

  test('full happy-path order placement scenario', async ({ checkoutPage, page }) => {
    await checkoutPage.fillCustomerInfo(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );

    // Step 2: verify that the products and total are present.
    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutPage.summaryItems).toHaveCount(2);
    await expect(checkoutPage.totalLabel).toBeVisible();

    await checkoutPage.finishOrder();

    // Step 3: confirm the order.
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
  });

  test('error when a required field is empty', async ({ checkoutPage }) => {
    await checkoutPage.continueButton.click();

    await expect(checkoutPage.checkoutErrorMessage).toBeVisible();
    await expect(checkoutPage.checkoutErrorMessage).toContainText('First Name is required');
  });

  test('total amount includes tax (subtotal + tax = total)', async ({ checkoutPage }) => {
    await checkoutPage.fillCustomerInfo(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );

    const subtotalText = await checkoutPage.subtotalLabel.textContent();
    const taxText = await checkoutPage.taxLabel.textContent();
    const totalText = await checkoutPage.totalLabel.textContent();

    const subtotal = parseFloat(subtotalText!.replace(/[^0-9.]/g, ''));
    const tax = parseFloat(taxText!.replace(/[^0-9.]/g, ''));
    const total = parseFloat(totalText!.replace(/[^0-9.]/g, ''));

    // Calculation check: an example of business-logic validation, not just UI validation.
    expect(total).toBeCloseTo(subtotal + tax, 2);
  });

  test('the "Back Home" button returns to inventory after completion', async ({ checkoutPage, page }) => {
    await checkoutPage.fillCustomerInfo(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );
    await checkoutPage.finishOrder();
    await checkoutPage.backHomeButton.click();

    await expect(page).toHaveURL(/inventory\.html/);
  });
});
