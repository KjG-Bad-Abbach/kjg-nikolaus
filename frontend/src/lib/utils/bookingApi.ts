/**
 * Booking API Utilities
 * Functions for interacting with the Strapi backend API
 */

import { sendRequest } from '$lib/api/client';
import type { Booking, Config, TimeSlot, ContactPerson, Location, Child } from '$lib/types/booking';
import { SvelteDate } from 'svelte/reactivity';
import { formatDateTimeRange } from './dateFormat';

type TimeSlotResponse = Omit<TimeSlot, 'id' | 'label'> & { id: number };

function normalizeTimeSlots(timeSlots: TimeSlotResponse[]): TimeSlot[] {
  return timeSlots
    .map((slot) => ({
      ...slot,
      id: slot.documentId,
      label: formatDateTimeRange(new Date(slot.start), new Date(slot.end)),
    }))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

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
  const response = await sendRequest<{
    data: Omit<Booking, 'time_slots'> & { time_slots: TimeSlotResponse[] };
  }>({
    url: `/api/bookings/${bookingId}?populate=*`,
  });

  return { ...response.data, time_slots: normalizeTimeSlots(response.data.time_slots) };
}

/**
 * Load available time slots from API
 * Credits the booking's persisted reservations without filtering the inventory
 */
export async function loadTimeSlots(reservedTimeSlotIds: string[]): Promise<TimeSlot[]> {
  const response = await sendRequest<{
    data: (TimeSlotResponse & { available_reservations: number })[];
    meta?: { pagination: { pageSize: number; pageCount: number } };
  }>({ url: '/api/time-slots' });
  const timeSlots = [...response.data];
  const pagination = response.meta?.pagination;
  if (pagination) {
    for (let page = 2; page <= pagination.pageCount; page++) {
      const nextPage = await sendRequest<typeof response>({
        url: `/api/time-slots?pagination[page]=${page}&pagination[pageSize]=${pagination.pageSize}`,
      });
      timeSlots.push(...nextPage.data);
    }
  }

  // Parse dates and return
  return normalizeTimeSlots(
    timeSlots.map((slot) => ({
      ...slot,
      available_reservations:
        slot.available_reservations + (reservedTimeSlotIds.includes(slot.documentId) ? 1 : 0),
    })),
  );
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

export async function sendVerificationEmail(bookingId: string): Promise<void> {
  await sendRequest({
    url: `/api/bookings/${bookingId}/send-verification-email`,
    method: 'POST',
  });
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
        children: children.map(({ name, identification_trait, speech }) => ({
          name,
          identification_trait,
          speech,
        })),
        additional_notes: additionalNotes,
      },
    },
  });

  return response.data;
}
