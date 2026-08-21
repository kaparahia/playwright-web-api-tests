import { expect, type APIResponse } from '@playwright/test';

type JsonResponseExpectation = {
  status?: number;
  statusText?: string;
};

export async function measureAsync<T>(operation: () => Promise<T>) {
  const start = Date.now();
  const result = await operation();

  return {
    result,
    durationMs: Date.now() - start,
  };
}

export function assertJsonResponse(
  response: APIResponse,
  { status = 200, statusText }: JsonResponseExpectation = {},
) {
  expect(response.status()).toBe(status);

  if (statusText) {
    expect(response.statusText()).toBe(statusText);
  }

  expect(response.headers()['content-type']).toContain('application/json');
}

export function assertResponseCompletesWithin(durationMs: number, maxDurationMs: number) {
  expect(durationMs).toBeLessThan(maxDurationMs);
}

export function assertObjectMatches<T extends object>(actual: T, expected: Partial<T>): void;
export function assertObjectMatches(actual: object, expected: object) {
  const actualObject = actual as Record<string, unknown>;

  for (const [key, value] of Object.entries(expected)) {
    expect(actualObject).toHaveProperty(key, value);
  }
}

export function assertArrayContainsEqualItem<T>(items: T[], expectedItem: T) {
  expect(items).toContainEqual(expectedItem);
}

export function assertValuesAreDifferent(actual: unknown, unexpected: unknown) {
  expect(actual).not.toEqual(unexpected);
}
