import { expect } from '@playwright/test';
import { Product } from '../api/types/product.types';

/**
 * Checks the structure, data types, and business constraints of a product.
 */
export function assertValidProductSchema(product: Product) {
  assertRequiredProductProperties(product);
  assertValidProductId(product.id);
  assertNonEmptyString(product.title, 'title');
  assertValidProductPrice(product.price);
  assertNonEmptyString(product.description, 'description');
  assertNonEmptyString(product.category, 'category');
  assertValidImageUrl(product.image);
  assertValidRating(product.rating);
}

function assertRequiredProductProperties(product: Product) {
  expect(product).toHaveProperty('id');
  expect(product).toHaveProperty('title');
  expect(product).toHaveProperty('price');
  expect(product).toHaveProperty('description');
  expect(product).toHaveProperty('category');
  expect(product).toHaveProperty('image');
  expect(product).toHaveProperty('rating');
}

function assertValidProductId(id: number) {
  expect(typeof id).toBe('number');
  expect(Number.isInteger(id)).toBe(true);
  expect(id).toBeGreaterThan(0);
}

function assertNonEmptyString(value: string, fieldName: string) {
  expect(typeof value, `${fieldName} must be a string`).toBe('string');
  expect(value.length, `${fieldName} must not be empty`).toBeGreaterThan(0);
}

function assertValidProductPrice(price: number) {
  expect(typeof price).toBe('number');
  expect(price).toBeGreaterThan(0);
}

function assertValidImageUrl(imageUrl: string) {
  expect(typeof imageUrl).toBe('string');
  expect(imageUrl).toMatch(/^https?:\/\//);
}

function assertValidRating(rating: Product['rating']) {
  expect(rating).toBeDefined();
  expect(typeof rating.rate).toBe('number');
  expect(rating.rate).toBeGreaterThanOrEqual(0);
  expect(rating.rate).toBeLessThanOrEqual(5);
  expect(typeof rating.count).toBe('number');
  expect(rating.count).toBeGreaterThanOrEqual(0);
}

// JWT looks like three base64 parts separated by dots: header.payload.signature.
export function assertLooksLikeJwt(token: string) {
  expect(typeof token).toBe('string');
  expect(token.split('.').length).toBe(3);
}
