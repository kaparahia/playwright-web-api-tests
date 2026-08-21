import { test, expect } from '../../fixtures/fixtures';
import { Product, ProductPayload } from '../../api/types/product.types';

const newProductPayload: ProductPayload = {
  title: 'Test Automation Backpack',
  price: 49.99,
  description: 'Товар, створений автотестом для перевірки POST /products',
  category: 'electronics',
  image: 'https://i.pravatar.cc',
};

test.describe('API: POST /products (створення)', () => {
  test('створення товару повертає 201 і відображає надіслані дані', async ({ apiClient }) => {
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

test.describe('API: PUT /products/:id (повне оновлення)', () => {
  test('оновлення товару повертає 200 і нові значення полів', async ({ apiClient }) => {
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

test.describe('API: PATCH /products/:id (часткове оновлення)', () => {
  test('часткове оновлення змінює тільки передане поле', async ({ apiClient }) => {
    const response = await apiClient.patchProduct(1, { price: 123.45 });

    expect(response.status()).toBe(200);
    const patched: Product = await response.json();

    expect(patched.price).toBe(123.45);
  });
});

test.describe('API: DELETE /products/:id', () => {
  test('видалення товару повертає 200 і об\'єкт видаленого товару', async ({ apiClient }) => {
    const response = await apiClient.deleteProduct(1);

    expect(response.status()).toBe(200);
    const deleted: Product = await response.json();

    // The server must return the exact product that was deleted, identified by id.
    expect(deleted.id).toBe(1);
  });
});
