/**
 * Unit tests for unsaved changes detection
 * @vitest-environment happy-dom
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { registerCheckUnsavedChanges } from './unsavedChanges';

describe('unsavedChanges', () => {
  beforeEach(() => {
    // Reset the callback before each test
    registerCheckUnsavedChanges(() => false);
  });

  describe('registerCheckUnsavedChanges', () => {
    it('should register a callback', () => {
      const callback = vi.fn(() => true);
      registerCheckUnsavedChanges(callback);

      // Trigger beforeunload event
      const event = new Event('beforeunload') as BeforeUnloadEvent;
      window.dispatchEvent(event);

      expect(callback).toHaveBeenCalledOnce();
    });

    it('should show confirmation message when callback returns true', () => {
      registerCheckUnsavedChanges(() => true);

      const event = new Event('beforeunload') as BeforeUnloadEvent;
      Object.defineProperty(event, 'returnValue', {
        writable: true,
        value: '',
      });

      window.dispatchEvent(event);

      expect(event.returnValue).toContain('ungespeicherte Änderungen');
    });

    it('should not show confirmation message when callback returns false', () => {
      registerCheckUnsavedChanges(() => false);

      const event = new Event('beforeunload') as BeforeUnloadEvent;
      Object.defineProperty(event, 'returnValue', {
        writable: true,
        value: '',
      });

      window.dispatchEvent(event);

      expect(event.returnValue).toBe('');
    });

    it('should handle popstate event', () => {
      const callback = vi.fn(() => true);
      registerCheckUnsavedChanges(callback);

      const event = new Event('popstate') as BeforeUnloadEvent;
      Object.defineProperty(event, 'returnValue', {
        writable: true,
        value: '',
      });

      window.dispatchEvent(event);

      expect(callback).toHaveBeenCalledOnce();
      expect(event.returnValue).toContain('ungespeicherte Änderungen');
    });

    it('should use different message for popstate', () => {
      registerCheckUnsavedChanges(() => true);

      const event = new Event('popstate') as BeforeUnloadEvent;
      Object.defineProperty(event, 'returnValue', {
        writable: true,
        value: '',
      });

      window.dispatchEvent(event);

      expect(event.returnValue).toContain('neu laden');
    });

    it('should use "verlassen" message for beforeunload', () => {
      registerCheckUnsavedChanges(() => true);

      const event = new Event('beforeunload') as BeforeUnloadEvent;
      Object.defineProperty(event, 'returnValue', {
        writable: true,
        value: '',
      });

      window.dispatchEvent(event);

      expect(event.returnValue).toContain('verlassen');
    });
  });
});
