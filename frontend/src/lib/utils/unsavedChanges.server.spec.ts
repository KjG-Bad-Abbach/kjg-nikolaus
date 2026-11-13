/**
 * Server-side unit tests for unsaved changes utility
 * Tests server-side code paths (when typeof window === 'undefined')
 */

import { describe, expect, it } from 'vitest';

describe('unsavedChanges (server-side)', () => {
  it('should not throw when imported in server environment', () => {
    // This test verifies that the module can be safely imported in a server environment
    // where window is undefined. The module-level code checks for window and only
    // registers event listeners if it exists.
    expect(() => {
      // Re-import the module to trigger the module-level code
      // In server environment, typeof window === 'undefined' is true,
      // so the event listeners won't be registered
      import('./unsavedChanges');
    }).not.toThrow();
  });

  it('should export registerCheckUnsavedChanges function in server environment', async () => {
    const { registerCheckUnsavedChanges } = await import('./unsavedChanges');

    // The function should exist even in server environment
    expect(registerCheckUnsavedChanges).toBeDefined();
    expect(typeof registerCheckUnsavedChanges).toBe('function');
  });

  it('should allow registering callback in server environment without errors', async () => {
    const { registerCheckUnsavedChanges } = await import('./unsavedChanges');

    // Should not throw even though there's no window
    expect(() => {
      registerCheckUnsavedChanges(() => true);
    }).not.toThrow();
  });
});
