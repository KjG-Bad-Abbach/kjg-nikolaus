/**
 * Booking Initialization Utilities
 * Functions for initializing the booking application
 */

import { clone } from './object';
import { registerCheckUnsavedChanges } from './unsavedChanges';
import { loadConfig, loadBooking, loadTimeSlots } from './bookingApi';
import { getFirstIncompleteStep, calculateStepCompletionStatus } from './stepNavigation';
import type { ApiError } from '$lib/types/booking';
import type { UIStore } from '$lib/stores/uiStore.svelte';
import type { OptionsStore } from '$lib/stores/optionsStore.svelte';
import type { BookingStore } from '$lib/stores/bookingStore.svelte';
import type { ValidationStore } from '$lib/stores/validationStore.svelte';

export interface InitializeParams {
  uiStore: UIStore;
  optionsStore: OptionsStore;
  bookingStore: BookingStore;
  validationStore: ValidationStore;
}

export interface LoadBookingParams extends InitializeParams {
  bookingId: string;
}

/**
 * Initialize the booking application
 * Loads config and sets up initial state
 */
export async function initializeBooking({
  uiStore,
  optionsStore,
  bookingStore,
  validationStore,
}: InitializeParams): Promise<void> {
  if (uiStore.isLoading) {
    return;
  }

  uiStore.setLoading(true);
  uiStore.setError(null);
  bookingStore.reset();

  // Register unsaved changes callback
  registerCheckUnsavedChanges(() => bookingStore.hasChanges());

  try {
    // Load config if not already loaded
    if (!optionsStore.id) {
      const apiWindow =
        typeof window !== 'undefined'
          ? (window as Window & { API_TOKEN?: string; API_BASE_URL?: string })
          : undefined;
      // The first config request already needs the browser/build fallback.
      if (apiWindow) {
        apiWindow.API_TOKEN ||= import.meta.env.VITE_API_TOKEN;
        apiWindow.API_BASE_URL ||= import.meta.env.VITE_API_BASE_URL;
      }

      const config = await loadConfig();
      optionsStore.update(config);

      if (apiWindow) {
        apiWindow.API_TOKEN ||= config.api_token;
        apiWindow.API_BASE_URL ||= config.api_base_url;
      }

      // Set view based on intro text
      if (config.introduction_text && config.introduction_text.length) {
        uiStore.setView('intro');
      } else {
        uiStore.setView('steps');
      }
    }

    // Get booking ID from URL (only in browser)
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const bookingId = searchParams.get('id');
      uiStore.setBookingId(bookingId);

      uiStore.setLoading(false);

      // Load booking if ID present
      if (bookingId) {
        uiStore.setView('steps');
        await loadBookingData({
          bookingId,
          uiStore,
          optionsStore,
          bookingStore,
          validationStore,
        });
      }
    } else {
      uiStore.setLoading(false);
    }
  } catch (error) {
    console.error(error);
    uiStore.setLoading(false);
    uiStore.setError(error as ApiError, true);
  }
}

/**
 * Load booking data from API and update stores
 */
export async function loadBookingData({
  bookingId,
  uiStore,
  optionsStore,
  bookingStore,
  validationStore,
}: LoadBookingParams): Promise<void> {
  if (uiStore.isLoading) {
    return;
  }

  uiStore.setLoading(true);
  uiStore.setError(null);
  bookingStore.reset();

  try {
    // Fetch booking
    const data = await loadBooking(bookingId);
    const clonedData = clone(data);

    // Update booking store
    bookingStore.updateFromDatabase(clonedData);

    // Fetch time slots
    const timeSlots = await loadTimeSlots(
      (clonedData.time_slots || []).map((slot) => slot.documentId),
    );
    bookingStore.setAvailableTimeSlots(timeSlots);

    // Can jump to any step when editing existing booking
    uiStore.setCanJumpToAnyStep(true);

    // Navigate to first incomplete step
    const targetStep = getFirstIncompleteStep(clonedData, optionsStore.max_time_slots);
    validationStore.clearAll();
    uiStore.setStep(targetStep);

    // Update step completion status
    const stepStatus = calculateStepCompletionStatus(clonedData, optionsStore.max_time_slots);
    stepStatus.forEach((status, index) => {
      uiStore.updateStep(index, status);
    });
  } catch (error) {
    console.error(error);
    uiStore.setError(error as ApiError);
  } finally {
    uiStore.setLoading(false);
  }
}

/**
 * Fetch time slots and update store
 */
export async function fetchAndUpdateTimeSlots(
  bookingId: string | null,
  bookingStore: BookingStore,
  uiStore: UIStore,
): Promise<void> {
  if (uiStore.isLoading) {
    return;
  }

  uiStore.setLoading(true);
  uiStore.setError(null);
  try {
    const timeSlots = await loadTimeSlots(
      bookingId
        ? bookingStore.bookingLoadedFromDatabase.time_slots.map((slot) => slot.documentId)
        : [],
    );
    bookingStore.setAvailableTimeSlots(timeSlots);
  } catch (error) {
    console.error(error);
    uiStore.setError(error as ApiError);
  } finally {
    uiStore.setLoading(false);
  }
}

/**
 * Handle step change with unsaved changes check
 */
export async function handleStepChange(
  newStep: number,
  canJumpToAnyStep: boolean,
  hasChanges: boolean,
  bookingStore: BookingStore,
  validationStore: ValidationStore,
  uiStore: UIStore,
  fetchTimeSlots: () => Promise<void>,
): Promise<void> {
  if (!canJumpToAnyStep) {
    return;
  }

  // Check for unsaved changes
  if (hasChanges) {
    // Only show confirm dialog in browser environment
    if (typeof window !== 'undefined') {
      const confirmed = confirm(
        'Wenn Sie fortfahren, werden Ihre Änderungen verloren gehen. Fortfahren?',
      );
      if (!confirmed) {
        return;
      }
    }
    // Revert to database state
    bookingStore.revertToDatabase();
  }

  validationStore.clearAll();
  uiStore.setStep(newStep);

  // Fetch time slots when navigating to time slot step
  if (hasChanges || newStep === 2) {
    await fetchTimeSlots();
  }
}
