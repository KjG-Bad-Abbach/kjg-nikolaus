/**
 * Server-side unit tests for API client
 * Tests server-side code paths (when typeof window === 'undefined')
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sendRequest } from './client';

describe('API client (server-side)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Clear any environment variables
    delete (import.meta.env as { VITE_API_TOKEN?: string }).VITE_API_TOKEN;
    delete (import.meta.env as { VITE_API_BASE_URL?: string }).VITE_API_BASE_URL;
  });

  it('should use import.meta.env.VITE_API_TOKEN when window is undefined', async () => {
    // Set environment variable
    (import.meta.env as { VITE_API_TOKEN?: string }).VITE_API_TOKEN = 'env-token-123';

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' }),
    });

    await sendRequest({ url: 'test' });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer env-token-123',
        }),
      }),
    );
  });

  it('should use import.meta.env.VITE_API_BASE_URL when window is undefined', async () => {
    // Set environment variable
    (import.meta.env as { VITE_API_BASE_URL?: string }).VITE_API_BASE_URL =
      'https://api.example.com';

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' }),
    });

    await sendRequest({ url: 'test' });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/api/test',
      expect.any(Object),
    );
  });

  it('should handle hook being null when window is undefined', async () => {
    // In server environment, hook should be null (no window.__bookingTestApi)
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' }),
    });

    const result = await sendRequest({ url: 'test' });

    expect(result).toEqual({ data: 'test' });
    expect(global.fetch).toHaveBeenCalled();
  });

  it('should handle errors with missing error.message', async () => {
    // Create an error without a message property
    const errorWithoutMessage = Object.create(Error.prototype);
    errorWithoutMessage.toString = () => 'Custom error string';

    global.fetch = vi.fn().mockRejectedValue(errorWithoutMessage);

    await expect(sendRequest({ url: 'test' })).rejects.toMatchObject({
      message: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
      body: expect.objectContaining({
        message: expect.stringContaining('Custom error'),
      }),
    });
  });

  it('should use empty string for API_BASE_URL when undefined', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: 'test' }),
    });

    await sendRequest({ url: 'test' });

    // When API_BASE_URL is undefined, it should use empty string
    expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.any(Object));
  });
});
