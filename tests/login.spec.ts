import { test, expect } from '../fixtures/fixtures';
import { users } from '../utils/test-data';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('successful login with a valid user', async ({ loginPage, inventoryPage, page }) => {
    await loginPage.login(users.standard.username, users.standard.password);

    // Verify navigation to the expected page, one of the basic E2E checks.
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.pageTitle).toHaveText('Products');
    await expect(inventoryPage.inventoryItems.first()).toBeVisible();
  });

  test('error when logging in with a locked-out user', async ({ loginPage }) => {
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('locked out');
  });

  test('error when the password is incorrect', async ({ loginPage }) => {
    await loginPage.login(users.standard.username, 'wrong_password');

    const errorText = await loginPage.getErrorText();
    expect(errorText).toContain('do not match');
  });

  test('error when fields are empty', async ({ loginPage }) => {
    await loginPage.loginButton.click();

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Username is required');
  });

  test('password field hides entered characters', async ({ loginPage }) => {
    await loginPage.passwordInput.fill('secret_sauce');

    // Attribute check: a typical verification of an element property.
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });
});
