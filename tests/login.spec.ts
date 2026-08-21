import { test, expect } from '../fixtures/fixtures';
import { users } from '../utils/test-data';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('успішний логін валідним користувачем', async ({ loginPage, inventoryPage, page }) => {
    await loginPage.login(users.standard.username, users.standard.password);

    // Verify navigation to the expected page, one of the basic E2E checks.
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    await expect(inventoryPage.inventoryItems.first()).toBeVisible();
  });

  test('помилка при логіні заблокованого користувача', async ({ loginPage }) => {
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('locked out');
  });

  test('помилка при невірному паролі', async ({ loginPage }) => {
    await loginPage.login(users.standard.username, 'wrong_password');

    const errorText = await loginPage.getErrorText();
    expect(errorText).toContain('do not match');
  });

  test('помилка при порожніх полях', async ({ loginPage }) => {
    await loginPage.loginButton.click();

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Username is required');
  });

  test('поле пароль приховує введені символи', async ({ loginPage }) => {
    await loginPage.passwordInput.fill('secret_sauce');

    // Attribute check: a typical verification of an element property.
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });
});
