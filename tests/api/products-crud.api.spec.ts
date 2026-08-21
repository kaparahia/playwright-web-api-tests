import { test, expect } from '../../fixtures/fixtures';
import { Product, ProductPayload } from '../../api/types/product.types';

const newProductPayload: ProductPayload = {
  title: 'Test Automation Backpack',
  price: 49.99,
  description: 'Product created by an automated test to validate POST /products',
  category: 'electronics',
  image: 'https://i.pravatar.cc',
};

test.describe('API: POST /products (create)', () => {
  test('creating a product returns 201 and reflects the submitted data', async ({ apiClient }) => {
    const response = await apiClient.createProduct(newProductPayload);

    expect(response.status()).toBe(201);
    const created: Product = await response.json();

    // Verify that the server generated an id.
    expect(created).toHaveProperty('id');
    expect(typeof created.id).toBe('number');

    // Check request-body-to-response-body consistency: all submitted fields
    // must be returned without changes.
    expect(created.title).toBe(newProductPayload.title);
    expect(created.price).toBe(newProductPayload.price);
    expect(created.description).toBe(newProductPayload.description);
    expect(created.category).toBe(newProductPayload.category);
    expect(created.image).toBe(newProductPayload.image);
  });
});

test.describe('API: PUT /products/:id (full update)', () => {
  test('updating a product returns 200 and the new field values', async ({ apiClient }) => {
    const updatedPayload: ProductPayload = {
      ...newProductPayload,
      title: 'Updated Backpack Title',
      price: 59.99,
    };

    const response = await apiClient.updateProduct(1, updatedPayload);

    expect(response.status()).toBe(200);
    const updated: Product = await response.json();

    expect(updated.id).toBe(1);
    expect(updated.title).toBe(updatedPayload.title);
    expect(updated.price).toBe(updatedPayload.price);
  });
});

test.describe('API: PATCH /products/:id (partial update)', () => {
  test('partial update changes only the provided field', async ({ apiClient }) => {
    const response = await apiClient.patchProduct(1, { price: 123.45 });

    expect(response.status()).toBe(200);
    const patched: Product = await response.json();

    expect(patched.price).toBe(123.45);
  });
});

test.describe('API: DELETE /products/:id', () => {
  test('deleting a product returns 200 and the deleted product object', async ({ apiClient }) => {
    const response = await apiClient.deleteProduct(1);

    expect(response.status()).toBe(200);
    const deleted: Product = await response.json();

    // The server must return the exact product that was deleted, identified by id.
    expect(deleted.id).toBe(1);
  });
});
