import { APIResponse } from '@playwright/test';
import { BaseApiClient, TimedResponse } from './BaseApiClient';
import { LoginRequest, ProductPayload } from '../types/product.types';

/**
 * Client for the public FakeStore API (https://fakestoreapi.com).
 * Each method maps to one endpoint, so tests use this class rather than raw
 * URLs, just as they use page objects for the UI.
 */
export class FakeStoreApiClient extends BaseApiClient {
  async getAllProducts(options?: { limit?: number; sort?: 'asc' | 'desc' }): Promise<APIResponse> {
    const params: Record<string, string | number> = {};
    if (options?.limit) params.limit = options.limit;
    if (options?.sort) params.sort = options.sort;
    return this.get('/products', params);
  }

  // Dedicated response-time measurement method for performance tests.
  async getAllProductsTimed(): Promise<TimedResponse> {
    return this.timed(() => this.get('/products'));
  }

  async getProductById(id: number): Promise<APIResponse> {
    return this.get(`/products/${id}`);
  }

  async getCategories(): Promise<APIResponse> {
    return this.get('/products/categories');
  }

  async getProductsByCategory(category: string, sort?: 'asc' | 'desc'): Promise<APIResponse> {
    const params: Record<string, string> = {};
    if (sort) params.sort = sort;
    return this.get(`/products/category/${encodeURIComponent(category)}`, params);
  }

  async login(credentials: LoginRequest): Promise<APIResponse> {
    return this.post('/auth/login', credentials);
  }

  async createProduct(payload: ProductPayload): Promise<APIResponse> {
    return this.post('/products', payload);
  }

  async updateProduct(id: number, payload: ProductPayload): Promise<APIResponse> {
    return this.put(`/products/${id}`, payload);
  }

  async patchProduct(id: number, payload: Partial<ProductPayload>): Promise<APIResponse> {
    return this.patch(`/products/${id}`, payload);
  }

  async deleteProduct(id: number): Promise<APIResponse> {
    return this.delete(`/products/${id}`);
  }
}
