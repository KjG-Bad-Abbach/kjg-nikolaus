import { describe, expect, it, beforeEach, vi } from 'vitest';
import { uiStore } from './uiStore.svelte';

describe('uiStore', () => {
  beforeEach(() => {
    uiStore.reset();
  });

  it('should have default values', () => {
    expect(uiStore.isLoading).toBe(false);
    expect(uiStore.error).toBe(null);
    expect(uiStore.askToReload).toBe(false);
    expect(uiStore.errorCloseCallback).toBe(null);
    expect(uiStore.view).toBe('intro');
    expect(uiStore.step).toBe(0);
    expect(uiStore.canJumpToAnyStep).toBe(false);
    expect(uiStore.bookingId).toBe(null);
    expect(uiStore.steps).toHaveLength(5);
  });

  it('should have correct default steps', () => {
    expect(uiStore.steps).toEqual([
      {
        name: 'Kontakt',
        testId: 'contact',
        anyFilled: false,
        allFilled: false,
      },
      {
        name: 'Adresse',
        testId: 'address',
        anyFilled: false,
        allFilled: false,
      },
      {
        name: 'Zeitslot',
        testId: 'time-slot',
        anyFilled: false,
        allFilled: false,
      },
      {
        name: 'Kinder',
        testId: 'children',
        anyFilled: false,
        allFilled: false,
      },
      {
        name: 'Kontrolle',
        testId: 'summary',
        anyFilled: false,
        allFilled: false,
      },
    ]);
  });

  it('should set loading state', () => {
    uiStore.setLoading(true);
    expect(uiStore.isLoading).toBe(true);

    uiStore.setLoading(false);
    expect(uiStore.isLoading).toBe(false);
  });

  it('should set error state', () => {
    const error = { message: 'Test error' };
    uiStore.setError(error);

    expect(uiStore.error).toEqual(error);
    expect(uiStore.askToReload).toBe(false);
    expect(uiStore.errorCloseCallback).toBe(null);
  });

  it('should set error with askToReload flag', () => {
    const error = { message: 'Test error' };
    uiStore.setError(error, true);

    expect(uiStore.error).toEqual(error);
    expect(uiStore.askToReload).toBe(true);
  });

  it('should set error with callback', () => {
    const error = { message: 'Test error' };
    const callback = vi.fn();
    uiStore.setError(error, false, callback);

    expect(uiStore.error).toEqual(error);
    expect(uiStore.errorCloseCallback).toBe(callback);
  });

  it('should close error', () => {
    const error = { message: 'Test error' };
    uiStore.setError(error);

    uiStore.closeError();

    expect(uiStore.error).toBe(null);
    expect(uiStore.errorCloseCallback).toBe(null);
  });

  it('should call error close callback when closing error', () => {
    const error = { message: 'Test error' };
    const callback = vi.fn();
    uiStore.setError(error, false, callback);

    uiStore.closeError();

    expect(callback).toHaveBeenCalledOnce();
    expect(uiStore.errorCloseCallback).toBe(null);
  });

  it('should set view', () => {
    uiStore.setView('steps');
    expect(uiStore.view).toBe('steps');

    uiStore.setView('intro');
    expect(uiStore.view).toBe('intro');
  });

  it('should set step', () => {
    uiStore.setStep(2);
    expect(uiStore.step).toBe(2);

    uiStore.setStep(0);
    expect(uiStore.step).toBe(0);
  });

  it('should not set step below 0', () => {
    uiStore.setStep(-1);
    expect(uiStore.step).toBe(0);
  });

  it('should not set step above max', () => {
    uiStore.setStep(10);
    expect(uiStore.step).toBe(0);
  });

  it('should not change step when setting invalid value from non-zero step', () => {
    uiStore.setStep(2);
    expect(uiStore.step).toBe(2);

    uiStore.setStep(-1);
    expect(uiStore.step).toBe(2);

    uiStore.setStep(10);
    expect(uiStore.step).toBe(2);
  });

  it('should set canJumpToAnyStep', () => {
    uiStore.setCanJumpToAnyStep(true);
    expect(uiStore.canJumpToAnyStep).toBe(true);

    uiStore.setCanJumpToAnyStep(false);
    expect(uiStore.canJumpToAnyStep).toBe(false);
  });

  it('should set bookingId', () => {
    uiStore.setBookingId('123');
    expect(uiStore.bookingId).toBe('123');

    uiStore.setBookingId(null);
    expect(uiStore.bookingId).toBe(null);
  });

  it('should update step metadata', () => {
    uiStore.updateStep(0, {
      anyFilled: true,
      allFilled: false,
    });

    expect(uiStore.steps[0].anyFilled).toBe(true);
    expect(uiStore.steps[0].allFilled).toBe(false);
    expect(uiStore.steps[0].name).toBe('Kontakt');
    expect(uiStore.steps[0].testId).toBe('contact');
  });

  it('should update step metadata partially', () => {
    uiStore.updateStep(1, {
      allFilled: true,
    });

    expect(uiStore.steps[1].allFilled).toBe(true);
    expect(uiStore.steps[1].anyFilled).toBe(false);
  });

  it('should not update step metadata with invalid index', () => {
    uiStore.updateStep(-1, { anyFilled: true });
    uiStore.updateStep(10, { anyFilled: true });

    expect(uiStore.steps[0].anyFilled).toBe(false);
  });

  it('should reset all state', () => {
    uiStore.setLoading(true);
    uiStore.setError({ message: 'Test error' }, true);
    uiStore.setView('steps');
    uiStore.setStep(2);
    uiStore.setCanJumpToAnyStep(true);
    uiStore.setBookingId('123');
    uiStore.updateStep(0, { anyFilled: true, allFilled: true });

    uiStore.reset();

    expect(uiStore.isLoading).toBe(false);
    expect(uiStore.error).toBe(null);
    expect(uiStore.askToReload).toBe(false);
    expect(uiStore.view).toBe('intro');
    expect(uiStore.step).toBe(0);
    expect(uiStore.canJumpToAnyStep).toBe(false);
    expect(uiStore.bookingId).toBe(null);
    expect(uiStore.steps[0].anyFilled).toBe(false);
    expect(uiStore.steps[0].allFilled).toBe(false);
  });
});
