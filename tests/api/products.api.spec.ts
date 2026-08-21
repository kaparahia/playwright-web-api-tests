import { test, expect } from '../../fixtures/fixtures';
import { Product } from '../../api/types/product.types';
import { assertValidProductSchema } from '../../utils/schema-validators';

test.describe('API: GET /products', () => {
  test('status 200, response headers and format are valid', async ({ apiClient }) => {
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

  test('returns a non-empty list of products', async ({ apiClient }) => {
    const response = await apiClient.getAllProducts();
    const products: Product[] = await response.json();

    // Check the item count: without this, the list could be empty despite a
    // "200 OK", which is easy to miss when checking only the status.
    expect(products.length).toBeGreaterThan(0);
  });

  test('each product in the list matches the expected schema', async ({ apiClient }) => {
    const response = await apiClient.getAllProducts();
    const products: Product[] = await response.json();

    for (const product of products) {
      assertValidProductSchema(product);
    }
  });

  test('response time stays below the acceptable threshold', async ({ apiClient }) => {
    const { response, durationMs } = await apiClient.getAllProductsTimed();

    expect(response.status()).toBe(200);
    // Performance check: a typical requirement for critical endpoints.
    expect(durationMs).toBeLessThan(3000);
  });

  test('query parameter limit restricts the number of results', async ({ apiClient }) => {
    const response = await apiClient.getAllProducts({ limit: 5 });
    const products: Product[] = await response.json();

    expect(response.status()).toBe(200);
    expect(products).toHaveLength(5);
  });

  test('query parameter sort=desc changes the order relative to asc', async ({ apiClient }) => {
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
  test('a valid id returns the correct product with the proper schema', async ({ apiClient }) => {
    const response = await apiClient.getProductById(1);

    expect(response.status()).toBe(200);
    const product: Product = await response.json();

    // Verify that the requested product was returned.
    expect(product.id).toBe(1);
    assertValidProductSchema(product);
  });

  test('product data is consistent between the list and detail endpoints', async ({ apiClient }) => {
    const listResponse = await apiClient.getAllProducts();
    const products: Product[] = await listResponse.json();
    const firstFromList = products[0];

    const detailResponse = await apiClient.getProductById(firstFromList.id);
    const productDetail: Product = await detailResponse.json();

    // Check data consistency between two endpoints: a common bug class where
    // the list and detail responses diverge.
    expect(productDetail).toEqual(firstFromList);
  });

  test('a non-existent id does not return a valid product', async ({ apiClient }) => {
    const response = await apiClient.getProductById(999999);

    // For a nonexistent id, FakeStoreAPI returns 200 with an empty body rather
    // than 404. This shows why the response content must be checked too.
    expect(response.status()).toBe(200);
    const body = await response.json().catch(() => null);
    expect(body).toBeFalsy();
  });
});

test.describe('API: GET /products/categories', () => {
  test('returns a list of categories in the expected format', async ({ apiClient }) => {
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
  test('all returned products actually belong to the requested category', async ({ apiClient }) => {
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
