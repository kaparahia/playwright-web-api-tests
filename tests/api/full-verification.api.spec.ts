import { test } from '../../fixtures/fixtures';
import type { Product } from '../../api/types/product.types';
import { assertValidProductSchema } from '../../utils/schema-validators';
import {
  assertArrayContainsEqualItem,
  assertJsonResponse,
  assertObjectMatches,
  assertResponseCompletesWithin,
  assertValuesAreDifferent,
  measureAsync,
} from '../../utils/api-assertions';

const PRODUCT_ID = 1;
const MISSING_PRODUCT_ID = 9_999_999;
const EXPECTED_CATEGORY = "men's clothing";
const MAX_RESPONSE_TIME_MS = 3_000;

test.describe('API: повна верифікація одного запиту (чекліст)', () => {
  test('GET /products/1 - статус, заголовки, схема, дані, час, консистентність', async ({
    apiClient,
  }) => {
    const { result: response, durationMs } = await measureAsync(() => apiClient.getProductById(PRODUCT_ID));

    await test.step('Перевірити HTTP-відповідь', async () => {
      assertJsonResponse(response, { statusText: 'OK' });
    });

    const product: Product = await test.step('Прочитати та перевірити товар', async () => {
      const product: Product = await response.json();
      assertValidProductSchema(product);
      assertObjectMatches(product, {
        id: PRODUCT_ID,
        category: EXPECTED_CATEGORY,
      });
      return product;
    });

    await test.step('Перевірити швидкість відповіді', async () => {
      assertResponseCompletesWithin(durationMs, MAX_RESPONSE_TIME_MS);
    });

    await test.step('Перевірити консистентність між endpoint-ами', async () => {
      const listResponse = await apiClient.getAllProducts();
      const allProducts: Product[] = await listResponse.json();
      assertArrayContainsEqualItem(allProducts, product);
    });

    await test.step('Перевірити неіснуючий товар', async () => {
      const missingResponse = await apiClient.getProductById(MISSING_PRODUCT_ID);
      const missingBody = await missingResponse.json().catch(() => null);
      assertValuesAreDifferent(missingBody, product);
    });
  });
});
