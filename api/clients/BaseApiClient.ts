import { APIRequestContext, APIResponse } from '@playwright/test';

export interface TimedResponse {
  response: APIResponse;
  durationMs: number;
}

/**
 * Base API client: a thin wrapper around Playwright's APIRequestContext.
 * Similar to BasePage, but for the API layer. It holds shared logic such as
 * response timing and common HTTP methods, inherited by clients like
 * FakeStoreApiClient. Add a new API by creating another BaseApiClient subclass.
 */
export class BaseApiClient {
  constructor(protected readonly request: APIRequestContext) {}

  // Wrapper for measuring response time, useful for performance checks.
  protected async timed(fn: () => Promise<APIResponse>): Promise<TimedResponse> {
    const start = Date.now();
    const response = await fn();
    const durationMs = Date.now() - start;
    return { response, durationMs };
  }

  async get(url: string, params?: Record<string, string | number>): Promise<APIResponse> {
    return this.request.get(url, { params });
  }

  async post(url: string, data: unknown): Promise<APIResponse> {
    return this.request.post(url, { data });
  }

  async put(url: string, data: unknown): Promise<APIResponse> {
    return this.request.put(url, { data });
  }

  async patch(url: string, data: unknown): Promise<APIResponse> {
    return this.request.patch(url, { data });
  }

  async delete(url: string): Promise<APIResponse> {
    return this.request.delete(url);
  }
}
