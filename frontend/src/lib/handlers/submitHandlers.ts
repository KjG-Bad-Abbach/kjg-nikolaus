/**
 * Form submission handlers for the booking flow
 * These wrap the core submission utilities with event handling and UI updates
 */

import type { UIStore } from '$lib/stores/uiStore.svelte';
import type { BookingStore } from '$lib/stores/bookingStore.svelte';
import type { ValidationStore } from '$lib/stores/validationStore.svelte';
import type { ApiError } from '$lib/types/booking';
import { sendVerificationEmail } from '$lib/utils/bookingApi';
import {
  submitContact,
  submitAddress,
  submitTimeSlots,
  submitChildren,
} from '$lib/utils/formSubmission';

export interface SubmitContext {
  uiStore: UIStore;
  bookingStore: BookingStore;
  validationStore: ValidationStore;
  reloadBooking: () => Promise<void>;
}

/**
 * Submits contact details (Step 0)
 * Handles both new bookings and existing booking updates
 */
export async function submitContactDetails(context: SubmitContext): Promise<void> {
  const result = await submitContact({
    contact: context.bookingStore.booking.contact_person,
    bookingId: context.uiStore.bookingId,
    uiStore: context.uiStore,
    bookingStore: context.bookingStore,
    validationStore: context.validationStore,
  });

  if (result.bookingId) {
    context.uiStore.setBookingId(result.bookingId);

    if (result.isNewBooking) {
      // New booking - wait for email verification before showing the next step
      context.uiStore.setView('email-verification-needed');
    } else {
      // Existing booking - reload data
      context.uiStore.setView('steps');
      await context.reloadBooking();
    }

    context.uiStore.setStep(1);
  }
}

export async function sendEmailVerification(context: SubmitContext): Promise<void> {
  const { uiStore } = context;
  if (uiStore.isLoading || !uiStore.bookingId) {
    return;
  }
  if (!confirm('E-Mail erneut senden?')) {
    return;
  }

  uiStore.setLoading(true);
  uiStore.setError(null);
  try {
    await sendVerificationEmail(uiStore.bookingId);
  } catch (error) {
    console.error(error);
    uiStore.setError(error as ApiError);
  } finally {
    uiStore.setLoading(false);
  }
}

/**
 * Submits address details (Step 1)
 */
export async function submitAddressStep(context: SubmitContext): Promise<void> {
  const success = await submitAddress({
    location: context.bookingStore.booking.location,
    presentLocation: context.bookingStore.booking.present_location,
    bookingId: context.uiStore.bookingId,
    uiStore: context.uiStore,
    validationStore: context.validationStore,
  });

  if (success) {
    await context.reloadBooking();
    context.uiStore.setStep(2);
  }
}

/**
 * Submits time slot selections (Step 2)
 */
export async function submitTimeSlotsStep(context: SubmitContext): Promise<void> {
  const success = await submitTimeSlots({
    selectedTimeSlotIds: context.bookingStore.selectedTimeSlotIds,
    bookingId: context.uiStore.bookingId,
    uiStore: context.uiStore,
    validationStore: context.validationStore,
    reloadBooking: context.reloadBooking,
  });

  if (success) {
    await context.reloadBooking();
    context.uiStore.setStep(3);
  }
}

/**
 * Submits children details and additional notes (Step 3)
 */
export async function submitChildrenStep(context: SubmitContext): Promise<void> {
  const success = await submitChildren({
    children: context.bookingStore.booking.children,
    additionalNotes: context.bookingStore.booking.additional_notes,
    bookingId: context.uiStore.bookingId,
    uiStore: context.uiStore,
    validationStore: context.validationStore,
  });

  if (success) {
    await context.reloadBooking();
    context.uiStore.setStep(4);
  }
}
