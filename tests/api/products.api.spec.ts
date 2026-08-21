import { test, expect } from '../../fixtures/fixtures';
import { Product } from '../../api/types/product.types';
import { assertValidProductSchema } from '../../utils/schema-validators';

test.describe('API: GET /products', () => {
  test('статус 200, заголовки та формат відповіді валідні', async ({ apiClient }) => {
    const response = await apiClient.getAllProducts();

    // 1. Status code.
    expect(response.status()).toBe(200);
    expect(response.ok()).toBeTruthy();

    // 2. Response headers: Content-Type must be JSON.
    expect(response.headers()['content-type']).toContain('application/json');

    // 3. Response body: valid JSON that parses without errors.
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('повертає непорожній список товарів', async ({ apiClient }) => {
    const response = await apiClient.getAllProducts();
    const products: Product[] = await response.json();

    // Check the item count: without this, the list could be empty despite a
    // "200 OK", which is easy to miss when checking only the status.
    expect(products.length).toBeGreaterThan(0);
  });

  test('кожен товар у списку відповідає очікуваній схемі', async ({ apiClient }) => {
    const response = await apiClient.getAllProducts();
    const products: Product[] = await response.json();

    for (const product of products) {
      assertValidProductSchema(product);
    }
  });

  test('час відповіді не перевищує прийнятний поріг', async ({ apiClient }) => {
    const { response, durationMs } = await apiClient.getAllProductsTimed();

    expect(response.status()).toBe(200);
    // Performance check: a typical requirement for critical endpoints.
    expect(durationMs).toBeLessThan(3000);
  });

  test('query-параметр limit обмежує кількість результатів', async ({ apiClient }) => {
    const response = await apiClient.getAllProducts({ limit: 5 });
    const products: Product[] = await response.json();

    expect(response.status()).toBe(200);
    expect(products).toHaveLength(5);
  });

  test('query-параметр sort=desc змінює порядок відносно asc', async ({ apiClient }) => {
    const ascResponse = await apiClient.getAllProducts({ sort: 'asc' });
    const descResponse = await apiClient.getAllProducts({ sort: 'desc' });

    const ascProducts: Product[] = await ascResponse.json();
    const descProducts: Product[] = await descResponse.json();

    const ascIds = ascProducts.map((p) => p.id);
    const descIds = descProducts.map((p) => p.id);

    // Verify actual sorting business logic rather than only status codes.
    expect(descIds).toEqual([...ascIds].reverse());
  });
});

test.describe('API: GET /products/:id', () => {
  test('валідний id повертає коректний товар з правильною схемою', async ({ apiClient }) => {
    const response = await apiClient.getProductById(1);

    expect(response.status()).toBe(200);
    const product: Product = await response.json();

    // Verify that the requested product was returned.
    expect(product.id).toBe(1);
    assertValidProductSchema(product);
  });

  test('дані товару узгоджені між списком і детальним ендпоінтом', async ({ apiClient }) => {
    const listResponse = await apiClient.getAllProducts();
    const products: Product[] = await listResponse.json();
    const firstFromList = products[0];

    const detailResponse = await apiClient.getProductById(firstFromList.id);
    const productDetail: Product = await detailResponse.json();

    // Check data consistency between two endpoints: a common bug class where
    // the list and detail responses diverge.
    expect(productDetail).toEqual(firstFromList);
  });

  test('неіснуючий id не повертає валідний товар', async ({ apiClient }) => {
    const response = await apiClient.getProductById(999999);

    // For a nonexistent id, FakeStoreAPI returns 200 with an empty body rather
    // than 404. This shows why the response content must be checked too.
    expect(response.status()).toBe(200);
    const body = await response.json().catch(() => null);
    expect(body).toBeFalsy();
  });
});

test.describe('API: GET /products/categories', () => {
  test('повертає список категорій очікуваного формату', async ({ apiClient }) => {
    const response = await apiClient.getCategories();

    expect(response.status()).toBe(200);
    const categories: string[] = await response.json();

    expect(Array.isArray(categories)).toBe(true);
    expect(categories.length).toBeGreaterThan(0);
    for (const category of categories) {
      expect(typeof category).toBe('string');
      expect(category.length).toBeGreaterThan(0);
    }
  });
});

test.describe('API: GET /products/category/:name', () => {
  test('усі повернуті товари дійсно належать запитаній категорії', async ({ apiClient }) => {
    const response = await apiClient.getProductsByCategory('electronics');

    expect(response.status()).toBe(200);
    const products: Product[] = await response.json();

    expect(products.length).toBeGreaterThan(0);
    // Business validation: the filter actually filters instead of returning everything.
    for (const product of products) {
      expect(product.category).toBe('electronics');
      assertValidProductSchema(product);
    }
  });
});
