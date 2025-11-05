/**
 * Booking API Utilities
 * Functions for interacting with the Strapi backend API
 */

import { sendRequest } from '$lib/api/client';
import type { Booking, Config, TimeSlot, ContactPerson, Location, Child } from '$lib/types/booking';
import { SvelteDate } from 'svelte/reactivity';

/**
 * Load application configuration from API
 */
export async function loadConfig(): Promise<Config> {
  const response = await sendRequest<{ data: Config }>({
    url: '/api/config?populate=*',
  });

  return {
    ...response.data,
    route_planning_deadline: new SvelteDate(response.data.route_planning_deadline),
    final_deadline: new SvelteDate(response.data.final_deadline),
  };
}

/**
 * Load booking by ID from API
 */
export async function loadBooking(bookingId: string): Promise<Booking> {
  const response = await sendRequest<{ data: Booking }>({
    url: `/api/bookings/${bookingId}?populate=*`,
  });

  return response.data;
}

/**
 * Load available time slots from API
 * If bookingId provided, loads time slots for that booking
 */
export async function loadTimeSlots(bookingId?: string): Promise<TimeSlot[]> {
  const url = bookingId
    ? `/api/time-slots?populate=*&filters[bookings][documentId]=${bookingId}`
    : '/api/time-slots?populate=*';

  const response = await sendRequest<{ data: TimeSlot[] }>({ url });

  // Parse dates and return
  return response.data.map((slot) => ({
    ...slot,
    start: slot.start,
    end: slot.end,
  }));
}

/**
 * Create new booking with contact information
 */
export async function createBooking(contact: ContactPerson): Promise<Booking> {
  const response = await sendRequest<{ data: Booking }>({
    url: '/api/bookings',
    method: 'POST',
    body: {
      data: {
        contact_person: contact,
      },
    },
  });

  return response.data;
}

/**
 * Update booking contact information
 */
export async function updateBookingContact(
  bookingId: string,
  contact: ContactPerson,
): Promise<Booking> {
  const response = await sendRequest<{ data: Booking }>({
    url: `/api/bookings/${bookingId}`,
    method: 'PUT',
    body: {
      data: {
        contact_person: contact,
      },
    },
  });

  return response.data;
}

/**
 * Update booking address information
 */
export async function updateBookingAddress(
  bookingId: string,
  location: Location,
  presentLocation: string,
): Promise<Booking> {
  const response = await sendRequest<{ data: Booking }>({
    url: `/api/bookings/${bookingId}`,
    method: 'PUT',
    body: {
      data: {
        location,
        present_location: presentLocation,
      },
    },
  });

  return response.data;
}

/**
 * Update booking time slots
 */
export async function updateBookingTimeSlots(
  bookingId: string,
  timeSlotIds: string[],
): Promise<Booking> {
  const response = await sendRequest<{ data: Booking }>({
    url: `/api/bookings/${bookingId}`,
    method: 'PUT',
    body: {
      data: {
        time_slots: timeSlotIds,
      },
    },
  });

  return response.data;
}

/**
 * Update booking children information
 */
export async function updateBookingChildren(
  bookingId: string,
  children: Child[],
  additionalNotes: string,
): Promise<Booking> {
  const response = await sendRequest<{ data: Booking }>({
    url: `/api/bookings/${bookingId}`,
    method: 'PUT',
    body: {
      data: {
        children,
        additional_notes: additionalNotes,
      },
    },
  });

  return response.data;
}
