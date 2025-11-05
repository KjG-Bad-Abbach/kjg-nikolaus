/**
 * Form Submission Utilities
 * Orchestrates form submission including validation, API calls, and state updates
 */

import { trim } from './string';
import type { ContactPerson, Location, Child, ApiError } from '$lib/types/booking';
import type { UIStore } from '$lib/stores/uiStore.svelte';
import type { BookingStore } from '$lib/stores/bookingStore.svelte';
import type { ValidationStore } from '$lib/stores/validationStore.svelte';
import {
  validateContactPerson,
  validateAddress,
  validateTimeSlots,
  validateChildren,
  extractApiValidationErrors,
  trimContactPerson,
  trimLocation,
  trimChildren,
} from './bookingValidation';
import {
  createBooking,
  updateBookingContact,
  updateBookingAddress,
  updateBookingTimeSlots,
  updateBookingChildren,
} from './bookingApi';

export interface SubmitContactParams {
  contact: ContactPerson;
  bookingId: string | null;
  uiStore: UIStore;
  bookingStore: BookingStore;
  validationStore: ValidationStore;
}

export interface SubmitAddressParams {
  location: Location;
  presentLocation: string;
  bookingId: string | null;
  canEditRoutePlanning: boolean;
  uiStore: UIStore;
  validationStore: ValidationStore;
}

export interface SubmitTimeSlotsParams {
  selectedTimeSlotIds: string[];
  bookingId: string | null;
  maxTimeSlots: number;
  uiStore: UIStore;
  validationStore: ValidationStore;
}

export interface SubmitChildrenParams {
  children: Child[];
  additionalNotes: string;
  bookingId: string | null;
  uiStore: UIStore;
  validationStore: ValidationStore;
}

/**
 * Submit contact details (Step 0)
 * @returns Updated booking ID if successful, null if validation failed
 */
export async function submitContact({
  contact,
  bookingId,
  uiStore,
  bookingStore,
  validationStore,
}: SubmitContactParams): Promise<{ bookingId: string | null; isNewBooking: boolean }> {
  if (uiStore.isLoading) {
    return { bookingId: null, isNewBooking: false };
  }

  uiStore.setLoading(true);
  uiStore.setError(null);
  validationStore.clearAll();

  try {
    // Clean input
    trimContactPerson(contact);

    // Validate required fields
    const errors = validateContactPerson(contact);
    if (Object.keys(errors).length > 0) {
      for (const [path, message] of Object.entries(errors)) {
        validationStore.setMessage(path, message);
      }
      return { bookingId: null, isNewBooking: false };
    }

    const isNewBooking = !bookingId;

    // Create or update booking
    const response = bookingId
      ? await updateBookingContact(bookingId, contact)
      : await createBooking(contact);

    if (isNewBooking) {
      // New booking - update booking store directly
      bookingStore.updateFromDatabase({ contact_person: contact });
    }

    return { bookingId: response.documentId!, isNewBooking };
  } catch (error) {
    console.error(error);
    const apiError = error as ApiError;
    uiStore.setError(apiError);

    // Extract validation errors from API response
    const errors = extractApiValidationErrors(apiError);
    for (const [path, message] of Object.entries(errors)) {
      validationStore.setMessage(path, message);
    }

    return { bookingId: null, isNewBooking: false };
  } finally {
    uiStore.setLoading(false);
  }
}

/**
 * Submit address (Step 1)
 * @returns true if successful, false if validation failed
 */
export async function submitAddress({
  location,
  presentLocation,
  bookingId,
  canEditRoutePlanning,
  uiStore,
  validationStore,
}: SubmitAddressParams): Promise<boolean> {
  if (uiStore.isLoading || !bookingId) {
    return false;
  }

  uiStore.setLoading(true);
  uiStore.setError(null);
  validationStore.clearAll();

  try {
    // Clean input
    trimLocation(location);
    const trimmedPresentLocation = trim(presentLocation);

    // Validate
    const errors = validateAddress(location, trimmedPresentLocation, canEditRoutePlanning);
    if (Object.keys(errors).length > 0) {
      for (const [path, message] of Object.entries(errors)) {
        validationStore.setMessage(path, message);
      }
      return false;
    }

    await updateBookingAddress(bookingId, location, trimmedPresentLocation);

    return true;
  } catch (error) {
    console.error(error);
    const apiError = error as ApiError;
    uiStore.setError(apiError);

    // Extract validation errors from API response
    const errors = extractApiValidationErrors(apiError);
    for (const [path, message] of Object.entries(errors)) {
      validationStore.setMessage(path, message);
    }

    return false;
  } finally {
    uiStore.setLoading(false);
  }
}

/**
 * Submit time slots (Step 2)
 * @returns true if successful, false if validation failed
 */
export async function submitTimeSlots({
  selectedTimeSlotIds,
  bookingId,
  maxTimeSlots,
  uiStore,
  validationStore,
}: SubmitTimeSlotsParams): Promise<boolean> {
  if (uiStore.isLoading || !bookingId) {
    return false;
  }

  uiStore.setLoading(true);
  uiStore.setError(null);
  validationStore.clearAll();

  try {
    // Validate
    const errors = validateTimeSlots(selectedTimeSlotIds, maxTimeSlots);
    if (Object.keys(errors).length > 0) {
      for (const [path, message] of Object.entries(errors)) {
        validationStore.setMessage(path, message);
      }
      return false;
    }

    await updateBookingTimeSlots(bookingId, selectedTimeSlotIds);

    return true;
  } catch (error) {
    console.error(error);
    uiStore.setError(error as ApiError);
    return false;
  } finally {
    uiStore.setLoading(false);
  }
}

/**
 * Submit children (Step 3)
 * @returns true if successful, false if validation failed
 */
export async function submitChildren({
  children,
  additionalNotes,
  bookingId,
  uiStore,
  validationStore,
}: SubmitChildrenParams): Promise<boolean> {
  if (uiStore.isLoading || !bookingId) {
    return false;
  }

  uiStore.setLoading(true);
  uiStore.setError(null);
  validationStore.clearAll();

  try {
    // Clean input
    trimChildren(children);

    // Validate
    const errors = validateChildren(children);
    if (Object.keys(errors).length > 0) {
      for (const [path, message] of Object.entries(errors)) {
        validationStore.setMessage(path, message);
      }
      return false;
    }

    await updateBookingChildren(bookingId, children, trim(additionalNotes));

    return true;
  } catch (error) {
    console.error(error);
    uiStore.setError(error as ApiError);
    return false;
  } finally {
    uiStore.setLoading(false);
  }
}
