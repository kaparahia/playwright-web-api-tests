import { test, expect } from '../../fixtures/fixtures';
import { LoginResponse } from '../../api/types/product.types';
import { assertLooksLikeJwt } from '../../utils/schema-validators';

test.describe('API: POST /auth/login', () => {
  test('valid credentials return a token in the correct format', async ({ apiClient }) => {
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

  test('wrong password does not return successful authentication', async ({ apiClient }) => {
    const response = await apiClient.login({
      username: 'mor_2314',
      password: 'wrong-password',
    });

    // Negative scenario: invalid data must not return 200 and a token.
    expect(response.ok()).toBeFalsy();
  });

  test('empty payload is handled as a request error', async ({ apiClient }) => {
    const response = await apiClient.login({ username: '', password: '' });

    expect(response.ok()).toBeFalsy();
  });
});
