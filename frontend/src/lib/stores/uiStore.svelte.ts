import type { Step, ApiError } from '$lib/types/booking';

/**
 * UI state store
 * Manages application UI state including view, loading, errors, and step navigation
 */

export type View = 'intro' | 'steps';

class UIStore {
  // Loading state
  isLoading = $state(false);

  // Error state
  error = $state<ApiError | null>(null);
  askToReload = $state(false);
  errorCloseCallback = $state<(() => void) | null>(null);

  // View state
  view = $state<View>('intro');

  // Step navigation
  step = $state(0);
  canJumpToAnyStep = $state(false);

  // Booking ID from URL
  bookingId = $state<string | null>(null);

  // Steps metadata
  steps = $state<Step[]>([
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

  /**
   * Set loading state
   */
  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  /**
   * Set error state
   */
  setError(error: ApiError | null, askToReload = false, callback: (() => void) | null = null) {
    this.error = error;
    this.askToReload = askToReload;
    this.errorCloseCallback = callback;
  }

  /**
   * Close error modal
   */
  closeError() {
    this.error = null;
    const callback = this.errorCloseCallback;
    this.errorCloseCallback = null;
    if (callback) {
      callback();
    }
  }

  /**
   * Set view
   */
  setView(view: View) {
    this.view = view;
  }

  /**
   * Set current step
   */
  setStep(step: number) {
    if (step >= 0 && step < this.steps.length) {
      this.step = step;
    }
  }

  /**
   * Set whether user can jump to any step
   */
  setCanJumpToAnyStep(canJump: boolean) {
    this.canJumpToAnyStep = canJump;
  }

  /**
   * Set booking ID
   */
  setBookingId(id: string | null) {
    this.bookingId = id;
  }

  /**
   * Update step metadata
   */
  updateStep(index: number, data: Partial<Step>) {
    if (index >= 0 && index < this.steps.length) {
      this.steps[index] = { ...this.steps[index], ...data };
    }
  }

  /**
   * Reset all UI state
   */
  reset() {
    this.isLoading = false;
    this.error = null;
    this.askToReload = false;
    this.errorCloseCallback = null;
    this.view = 'intro';
    this.step = 0;
    this.canJumpToAnyStep = false;
    this.bookingId = null;
    this.steps = [
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
    ];
  }
}

export const uiStore = new UIStore();
export type { UIStore, Step };
