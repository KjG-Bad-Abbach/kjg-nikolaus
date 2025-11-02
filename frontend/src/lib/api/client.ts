/**
 * API Client utility
 * Migrated from Alpine.js frontend (lines 1777-1878)
 * Handles HTTP requests to Strapi backend with automatic token injection
 */

import type { ApiError } from '$lib/types/booking';
import { clone } from '$lib/utils/object';

const BOOKING_TEST_API_HOOK = '__bookingTestApi';
let bookingTestApiWarningShown = false;

/**
 * Reset the test API warning flag (for testing purposes only)
 * @internal
 */
export function resetTestApiWarning(): void {
  bookingTestApiWarningShown = false;
}

/**
 * Test API hook interface for stubbing requests in tests
 */
interface TestApiHook {
  handleRequest: (params: {
    url: string;
    method: string;
    body: unknown | null;
    originalUrl: string;
  }) => Promise<unknown>;
}

declare global {
  interface Window {
    __bookingTestApi?: TestApiHook;
  }
}

export interface SendRequestParams {
  url: string;
  method?: string;
  body?: unknown;
}

/**
 * Send an HTTP request to the Strapi API
 * Automatically adds Bearer token and handles errors
 * Supports test API hook for stubbing in tests
 */
export async function sendRequest<T = unknown>({
  url,
  method = 'GET',
  body = null,
}: SendRequestParams): Promise<T> {
  let passthroughErrors = false;

  try {
    const originalUrl = url;
    // Prepare URL (trim leading slash and trim api/ prefix)
    url = url.replace(/^\/?(?:api\/)?/g, '');

    // Check for test API hook (for testing)
    const hook = typeof window !== 'undefined' ? window[BOOKING_TEST_API_HOOK] : null;
    if (hook && typeof hook.handleRequest === 'function') {
      if (!bookingTestApiWarningShown) {
        bookingTestApiWarningShown = true;
        console.warn(
          '[Nikolaus Booking] window.__bookingTestApi override is active; HTTP requests are being stubbed.',
        );
      }
      try {
        return (await hook.handleRequest({
          url,
          method,
          body: body ? clone(body) : null,
          originalUrl,
        })) as T;
      } catch (hookError) {
        passthroughErrors = true;
        throw hookError;
      }
    }

    // Get API configuration from environment or window
    const API_TOKEN =
      typeof window !== 'undefined'
        ? (window as { API_TOKEN?: string }).API_TOKEN
        : import.meta.env.VITE_API_TOKEN;
    const API_BASE_URL =
      typeof window !== 'undefined'
        ? (window as { API_BASE_URL?: string }).API_BASE_URL
        : import.meta.env.VITE_API_BASE_URL;

    // Prepare the fetch options
    const options: RequestInit = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (API_TOKEN) {
      (options.headers as Record<string, string>).Authorization = `Bearer ${API_TOKEN}`;
    }

    // If body is provided, stringify it and attach to the options
    if (body) {
      options.body = JSON.stringify(body);
    }

    // Send the fetch request
    const response = await fetch(`${API_BASE_URL ? API_BASE_URL : ''}/api/${url}`, options);

    // Handle non-OK responses (status codes outside of 200-299)
    if (!response.ok) {
      let responseBody: unknown = await response.text();
      try {
        responseBody = JSON.parse(responseBody as string);
      } catch {
        // Keep as text if not JSON
      }

      // Construct the error object
      const errorObj: ApiError = {
        message:
          (responseBody as { error?: { name?: string } })?.error?.name === 'ValidationError'
            ? 'Bitte überprüfe deine Eingaben.'
            : 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
        status: {
          code: response.status,
          text: response.statusText,
        },
        body: responseBody,
      };

      passthroughErrors = true;
      throw errorObj; // Throw error for further handling
    }

    // Parse and return the JSON response body
    return (await response.json()) as T;
  } catch (error) {
    if (passthroughErrors) {
      throw error; // Re-throw the error if it's a passthrough error
    }

    // Log the error and throw it so it can be handled by the caller
    console.error('Request failed:', error);

    // Construct a more detailed error object if it's a network error
    const errorDetails: ApiError = {
      message: (error as Error).message || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
      body: {
        message: (error as Error).toString(),
        fileName: (error as { fileName?: string }).fileName,
        lineNumber: (error as { lineNumber?: number }).lineNumber,
        columnNumber: (error as { columnNumber?: number }).columnNumber,
        cause: (error as { cause?: unknown }).cause,
        stack: (error as Error).stack?.split('\n'),
      },
    };

    throw errorDetails; // Re-throw the error so the caller can handle it
  }
}
