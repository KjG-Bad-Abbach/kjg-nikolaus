/**
 * Step Navigation Utilities
 * Pure functions for determining step completion and navigation
 */

import { isFilled } from './string';
import type { Booking, DerivedStores } from '$lib/types/booking';
import type { Step } from '$lib/stores/uiStore.svelte';

/**
 * Check if contact information is complete
 */
export function isContactComplete(contact?: Booking['contact_person']): boolean {
  return !!(
    contact &&
    isFilled(contact.first_name) &&
    isFilled(contact.last_name) &&
    isFilled(contact.email) &&
    isFilled(contact.phone_number)
  );
}

/**
 * Check if any contact field is filled
 */
export function isContactAnyFilled(contact?: Booking['contact_person']): boolean {
  return !!(
    contact &&
    (isFilled(contact.first_name) ||
      isFilled(contact.last_name) ||
      isFilled(contact.email) ||
      isFilled(contact.phone_number))
  );
}

/**
 * Check if address information is complete
 */
export function isAddressComplete(
  location?: Booking['location'],
  presentLocation?: string,
): boolean {
  const isLocationFilled = !!(
    location &&
    isFilled(location.street) &&
    isFilled(location.house_number) &&
    isFilled(location.zip_code) &&
    isFilled(location.place)
  );
  const isPresentLocationFilled = isFilled(presentLocation);

  return isLocationFilled && isPresentLocationFilled;
}

/**
 * Check if any address field is filled
 */
export function isAddressAnyFilled(
  location?: Booking['location'],
  presentLocation?: string,
): boolean {
  const isLocationAnyFilled = !!(
    location &&
    (isFilled(location.street) ||
      isFilled(location.house_number) ||
      isFilled(location.zip_code) ||
      isFilled(location.place))
  );
  const isPresentLocationFilled = isFilled(presentLocation);

  return isLocationAnyFilled || isPresentLocationFilled;
}

/**
 * Check if time slots are complete
 */
export function areTimeSlotsComplete(timeSlots?: Booking['time_slots'], maxTimeSlots = 3): boolean {
  return (timeSlots || []).length >= maxTimeSlots;
}

/**
 * Check if any time slot is selected
 */
export function areTimeSlotsAnyFilled(timeSlots?: Booking['time_slots']): boolean {
  return (timeSlots || []).length > 0;
}

/**
 * Check if children information is complete
 */
export function areChildrenComplete(children?: Booking['children']): boolean {
  return !!(
    children &&
    children.length > 0 &&
    children.every(
      (child) =>
        isFilled(child.name) && isFilled(child.identification_trait) && isFilled(child.speech),
    )
  );
}

/**
 * Check if any children field is filled
 */
export function areChildrenAnyFilled(
  children?: Booking['children'],
  additionalNotes?: string,
): boolean {
  return (children || []).length > 0 || isFilled(additionalNotes);
}

/**
 * Get the first incomplete step number (0-4)
 */
export function getFirstIncompleteStep(booking: Booking, maxTimeSlots = 3): number {
  const contactComplete = isContactComplete(booking.contact_person);
  const addressComplete = isAddressComplete(booking.location, booking.present_location);
  const timeSlotsComplete = areTimeSlotsComplete(booking.time_slots, maxTimeSlots);
  const childrenComplete = areChildrenComplete(booking.children);

  if (!contactComplete) return 0;
  if (!addressComplete) return 1;
  if (!timeSlotsComplete) return 2;
  if (!childrenComplete) return 3;
  return 4; // Summary step
}

/**
 * Calculate step completion status for all steps
 * Returns array of step objects with allFilled and anyFilled flags
 */
export function calculateStepCompletionStatus(
  booking: Booking,
  maxTimeSlots: number,
  derivedStores: DerivedStores,
): Partial<Step>[] {
  return [
    {
      // Step 0: Contact
      allFilled: isContactComplete(booking.contact_person),
      anyFilled: isContactAnyFilled(booking.contact_person),
    },
    {
      // Step 1: Address
      allFilled: isAddressComplete(booking.location, booking.present_location),
      anyFilled: isAddressAnyFilled(booking.location, booking.present_location),
    },
    {
      // Step 2: Time Slots
      allFilled: areTimeSlotsComplete(booking.time_slots, maxTimeSlots),
      anyFilled: areTimeSlotsAnyFilled(booking.time_slots),
    },
    {
      // Step 3: Children
      allFilled: areChildrenComplete(booking.children),
      anyFilled: areChildrenAnyFilled(booking.children, booking.additional_notes),
    },
    {
      // Step 4: Summary
      allFilled: derivedStores.isEverythingFilled,
      anyFilled: false,
    },
  ];
}
