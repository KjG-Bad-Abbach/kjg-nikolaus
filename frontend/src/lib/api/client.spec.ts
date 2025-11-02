/**
 * Unit tests for API client
 * @vitest-environment happy-dom
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resetTestApiWarning, sendRequest } from './client';

describe('API client', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.restoreAllMocks();
    // Reset test hook warning flag
    resetTestApiWarning();
    if (typeof window !== 'undefined') {
      (window as { __bookingTestApi?: unknown }).__bookingTestApi = undefined;
    }
  });

  describe('sendRequest', () => {
    it('should send GET request successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      const result = await sendRequest({ url: 'test' });
      expect(result).toEqual({ data: 'test' });
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should include Authorization header when API_TOKEN is set', async () => {
      // Set API_TOKEN on window
      (window as { API_TOKEN?: string }).API_TOKEN = 'test-token-123';

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      await sendRequest({ url: 'test' });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-token-123',
          }),
        }),
      );

      // Clean up
      delete (window as { API_TOKEN?: string }).API_TOKEN;
    });

    it('should send POST request with body', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const body = { name: 'test' };
      await sendRequest({ url: 'test', method: 'POST', body });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        }),
      );
    });

    it('should strip leading slash and api/ prefix from URL', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await sendRequest({ url: '/api/test' });
      expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.any(Object));

      await sendRequest({ url: 'api/test' });
      expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.any(Object));

      await sendRequest({ url: '/test' });
      expect(global.fetch).toHaveBeenCalledWith('/api/test', expect.any(Object));
    });

    it('should handle validation errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: async () => JSON.stringify({ error: { name: 'ValidationError' } }),
      });

      await expect(sendRequest({ url: 'test' })).rejects.toEqual({
        message: 'Bitte überprüfe deine Eingaben.',
        status: {
          code: 400,
          text: 'Bad Request',
        },
        body: { error: { name: 'ValidationError' } },
      });
    });

    it('should handle generic errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server Error',
      });

      await expect(sendRequest({ url: 'test' })).rejects.toEqual({
        message: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
        status: {
          code: 500,
          text: 'Internal Server Error',
        },
        body: 'Server Error',
      });
    });

    it('should handle network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));

      await expect(sendRequest({ url: 'test' })).rejects.toMatchObject({
        message: 'Network Error',
        body: expect.objectContaining({
          message: expect.stringContaining('Error'),
        }),
      });
    });

    it('should use test API hook when available', async () => {
      const mockHandleRequest = vi.fn().mockResolvedValue({ mocked: true });
      (window as { __bookingTestApi?: unknown }).__bookingTestApi = {
        handleRequest: mockHandleRequest,
      };

      const result = await sendRequest({ url: 'test', method: 'POST', body: { data: 'test' } });

      expect(result).toEqual({ mocked: true });
      expect(mockHandleRequest).toHaveBeenCalledWith({
        url: 'test',
        method: 'POST',
        body: { data: 'test' },
        originalUrl: 'test',
      });
    });

    it('should show warning only once for test API hook', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      (window as { __bookingTestApi?: unknown }).__bookingTestApi = {
        handleRequest: vi.fn().mockResolvedValue({}),
      };

      await sendRequest({ url: 'test1' });
      await sendRequest({ url: 'test2' });

      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('window.__bookingTestApi override is active'),
      );

      consoleSpy.mockRestore();
    });

    it('should pass through hook errors', async () => {
      const hookError = new Error('Hook Error');
      (window as { __bookingTestApi?: unknown }).__bookingTestApi = {
        handleRequest: vi.fn().mockRejectedValue(hookError),
      };

      await expect(sendRequest({ url: 'test' })).rejects.toBe(hookError);
    });
  });
});
