import { test, expect } from '../../fixtures/fixtures';
import { LoginResponse } from '../../api/types/product.types';
import { assertLooksLikeJwt } from '../../utils/schema-validators';

test.describe('API: POST /auth/login', () => {
  test('валідні креденшли повертають токен коректного формату', async ({ apiClient }) => {
    const response = await apiClient.login({
      username: 'mor_2314',
      password: '83r5^_',
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    const body: LoginResponse = await response.json();
    expect(body).toHaveProperty('token');
    assertLooksLikeJwt(body.token);
  });

  test('невірний пароль не повертає успішну автентифікацію', async ({ apiClient }) => {
    const response = await apiClient.login({
      username: 'mor_2314',
      password: 'wrong-password',
    });

    // Negative scenario: invalid data must not return 200 and a token.
    expect(response.ok()).toBeFalsy();
  });

  test('порожній payload обробляється як помилка запиту', async ({ apiClient }) => {
    const response = await apiClient.login({ username: '', password: '' });

    expect(response.ok()).toBeFalsy();
  });
});
