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
import type { DerivedStores } from '$lib/stores/derivedStores.svelte';

export interface StoreContext {
  uiStore: UIStore;
  bookingStore: BookingStore;
  validationStore: ValidationStore;
  optionsStore: OptionsStore;
  derivedStores: DerivedStores;
}

/**
 * Fetches available time slots for the current booking
 */
export async function fetchTimeSlots(
  bookingId: string | null,
  bookingStore: BookingStore,
  uiStore: UIStore,
): Promise<void> {
  await fetchAndUpdateTimeSlots(bookingId, bookingStore, uiStore);
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
      derivedStores: context.derivedStores,
    });
  }
}

/**
 * Handles step changes with validation
 */
export async function handleStepChange(
  newStep: number,
  canJumpToAnyStep: boolean,
  hasChanges: boolean,
  bookingStore: BookingStore,
  validationStore: ValidationStore,
  uiStore: UIStore,
  fetchTimeSlotsCallback: () => Promise<void>,
): Promise<void> {
  await utilHandleStepChange(
    newStep,
    canJumpToAnyStep,
    hasChanges,
    bookingStore,
    validationStore,
    uiStore,
    fetchTimeSlotsCallback,
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
export function handleEditContact(uiStore: UIStore): void {
  uiStore.setStep(0);
}

/**
 * Handles edit button click for address step
 */
export function handleEditAddress(uiStore: UIStore): void {
  uiStore.setStep(1);
}

/**
 * Handles edit button click for time slots step
 */
export function handleEditTimeSlots(uiStore: UIStore): void {
  uiStore.setStep(2);
}

/**
 * Handles edit button click for children step
 */
export function handleEditChildren(uiStore: UIStore): void {
  uiStore.setStep(3);
}
