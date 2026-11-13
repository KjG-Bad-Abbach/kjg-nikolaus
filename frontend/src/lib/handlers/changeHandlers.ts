/**
 * Field change handlers for form inputs in the booking flow
 */

import type { ContactPerson, Location, Child } from '$lib/types/booking';
import type { BookingStore } from '$lib/stores/bookingStore.svelte';

/**
 * Handles contact person field changes
 */
export function handleContactChange(contact: ContactPerson, bookingStore: BookingStore): void {
  bookingStore.updateField('contact_person', contact);
}

/**
 * Handles address field changes
 */
export function handleAddressChange(
  data: { location: Location; presentLocation: string },
  bookingStore: BookingStore,
): void {
  bookingStore.updateField('location', data.location);
  bookingStore.updateField('present_location', data.presentLocation);
}

/**
 * Handles time slot selection changes
 */
export function handleTimeSlotChange(selectedIds: string[], bookingStore: BookingStore): void {
  bookingStore.setSelectedTimeSlotIds(selectedIds);
}

/**
 * Handles children and additional notes changes
 */
export function handleChildrenChange(
  data: { children: Child[]; additionalNotes: string },
  bookingStore: BookingStore,
): void {
  bookingStore.updateField('children', data.children);
  bookingStore.updateField('additional_notes', data.additionalNotes);
}
