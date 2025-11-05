/**
 * Form submission handlers for the booking flow
 * These wrap the core submission utilities with event handling and UI updates
 */

import type { UIStore } from '$lib/stores/uiStore.svelte';
import type { BookingStore } from '$lib/stores/bookingStore.svelte';
import type { ValidationStore } from '$lib/stores/validationStore.svelte';
import type { OptionsStore } from '$lib/stores/optionsStore.svelte';
import type { DerivedStores } from '$lib/stores/derivedStores.svelte';
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
  optionsStore: OptionsStore;
  derivedStores: DerivedStores;
  reloadBooking: () => Promise<void>;
}

/**
 * Submits contact details (Step 0)
 * Handles both new bookings and existing booking updates
 */
export async function submitContactDetails(event: Event, context: SubmitContext): Promise<void> {
  event.preventDefault();

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
      // New booking - just move to next step
      context.uiStore.setView('steps');
    } else {
      // Existing booking - reload data
      context.uiStore.setView('steps');
      await context.reloadBooking();
    }

    context.uiStore.setStep(1);
  }
}

/**
 * Submits address details (Step 1)
 */
export async function submitAddressStep(event: Event, context: SubmitContext): Promise<void> {
  event.preventDefault();

  const success = await submitAddress({
    location: context.bookingStore.booking.location,
    presentLocation: context.bookingStore.booking.present_location,
    bookingId: context.uiStore.bookingId,
    canEditRoutePlanning: context.derivedStores.canEditRoutePlanning,
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
export async function submitTimeSlotsStep(event: Event, context: SubmitContext): Promise<void> {
  event.preventDefault();

  const success = await submitTimeSlots({
    selectedTimeSlotIds: context.bookingStore.selectedTimeSlotIds,
    bookingId: context.uiStore.bookingId,
    maxTimeSlots: context.optionsStore.max_time_slots,
    uiStore: context.uiStore,
    validationStore: context.validationStore,
  });

  if (success) {
    await context.reloadBooking();
    context.uiStore.setStep(3);
  }
}

/**
 * Submits children details and additional notes (Step 3)
 */
export async function submitChildrenStep(event: Event, context: SubmitContext): Promise<void> {
  event.preventDefault();

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
