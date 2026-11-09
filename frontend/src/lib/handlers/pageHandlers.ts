/**
 * Page-level handlers for navigation and editing in the booking flow
 */

import type { UIStore } from '$lib/stores/uiStore.svelte';
import type { BookingStore } from '$lib/stores/bookingStore.svelte';
import type { ValidationStore } from '$lib/stores/validationStore.svelte';
import {
  loadBookingData,
  fetchAndUpdateTimeSlots,
  handleStepChange as utilHandleStepChange,
} from '$lib/utils/bookingInit';
import type { OptionsStore } from '$lib/stores/optionsStore.svelte';

export interface StoreContext {
  uiStore: UIStore;
  bookingStore: BookingStore;
  validationStore: ValidationStore;
  optionsStore: OptionsStore;
}

/**
 * Reloads booking data from the database
 */
export async function reloadBooking(context: StoreContext): Promise<void> {
  if (context.uiStore.bookingId) {
    await loadBookingData({
      bookingId: context.uiStore.bookingId,
      uiStore: context.uiStore,
      optionsStore: context.optionsStore,
      bookingStore: context.bookingStore,
      validationStore: context.validationStore,
    });
  }
}

/**
 * Handles step changes with validation
 */
export async function handleStepChange(
  newStep: number,
  { uiStore, bookingStore, validationStore }: StoreContext,
): Promise<void> {
  await utilHandleStepChange(
    newStep,
    uiStore.canJumpToAnyStep,
    bookingStore.hasChanges(),
    bookingStore,
    validationStore,
    uiStore,
    () => fetchAndUpdateTimeSlots(uiStore.bookingId, bookingStore, uiStore),
  );
}

/**
 * Handles the start button click (move from intro to steps)
 */
export function handleStart(uiStore: UIStore): void {
  uiStore.setView('steps');
}

/**
 * Handles edit button click for contact step
 */
export async function handleEditContact(context: StoreContext): Promise<void> {
  await handleStepChange(0, context);
}

/**
 * Handles edit button click for address step
 */
export async function handleEditAddress(context: StoreContext): Promise<void> {
  await handleStepChange(1, context);
}

/**
 * Handles edit button click for time slots step
 */
export async function handleEditTimeSlots(context: StoreContext): Promise<void> {
  await handleStepChange(2, context);
}

/**
 * Handles edit button click for children step
 */
export async function handleEditChildren(context: StoreContext): Promise<void> {
  await handleStepChange(3, context);
}
