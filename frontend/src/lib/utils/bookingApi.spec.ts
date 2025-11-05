import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  loadConfig,
  loadBooking,
  loadTimeSlots,
  createBooking,
  updateBookingContact,
  updateBookingAddress,
  updateBookingTimeSlots,
  updateBookingChildren,
} from './bookingApi';
import type { Config, Booking, TimeSlot, ContactPerson, Location, Child } from '$lib/types/booking';
import { SvelteDate } from 'svelte/reactivity';

// Mock the sendRequest function
vi.mock('$lib/api/client', () => ({
  sendRequest: vi.fn(),
}));

describe('bookingApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loadConfig', () => {
    it('should load config and parse dates', async () => {
      const { sendRequest } = await import('$lib/api/client');
      const mockConfig: Config = {
        id: '1',
        documentId: 'config-1',
        route_planning_deadline: new SvelteDate('2024-12-01T00:00:00.000Z'),
        final_deadline: new SvelteDate('2024-12-05T00:00:00.000Z'),
        max_time_slots: 3,
        show_search_for_time_slots: false,
        introduction_text: [],
        privacy_policy_link: null,
        legal_notice_link: null,
      };

      vi.mocked(sendRequest).mockResolvedValue({ data: mockConfig });

      const result = await loadConfig();

      expect(sendRequest).toHaveBeenCalledWith({
        url: '/api/config?populate=*',
      });
      expect(result.route_planning_deadline).toBeInstanceOf(SvelteDate);
      expect(result.final_deadline).toBeInstanceOf(SvelteDate);
      expect(result.max_time_slots).toBe(3);
    });
  });

  describe('loadBooking', () => {
    it('should load booking by ID', async () => {
      const { sendRequest } = await import('$lib/api/client');
      const mockBooking: Booking = {
        documentId: 'booking-1',
        contact_person: {
          first_name: 'Max',
          last_name: 'Mustermann',
          email: 'max@example.com',
          phone_number: '+49 123',
        },
        location: {
          street: 'Hauptstraße',
          house_number: '123',
          zip_code: '12345',
          place: 'München',
        },
        present_location: 'Wohnzimmer',
        time_slots: [],
        children: [],
        additional_notes: '',
      };

      vi.mocked(sendRequest).mockResolvedValue({ data: mockBooking });

      const result = await loadBooking('booking-1');

      expect(sendRequest).toHaveBeenCalledWith({
        url: '/api/bookings/booking-1?populate=*',
      });
      expect(result).toEqual(mockBooking);
    });
  });

  describe('loadTimeSlots', () => {
    it('should load all time slots when no booking ID provided', async () => {
      const { sendRequest } = await import('$lib/api/client');
      const mockTimeSlots: TimeSlot[] = [
        {
          id: '1',
          documentId: 'slot-1',
          start: '2024-12-05T19:00:00+01:00',
          end: '2024-12-05T19:30:00+01:00',
          max_bookings: 4,
        },
      ];

      vi.mocked(sendRequest).mockResolvedValue({ data: mockTimeSlots });

      const result = await loadTimeSlots();

      expect(sendRequest).toHaveBeenCalledWith({
        url: '/api/time-slots?populate=*',
      });
      expect(result).toEqual(mockTimeSlots);
    });

    it('should load time slots for specific booking when ID provided', async () => {
      const { sendRequest } = await import('$lib/api/client');
      const mockTimeSlots: TimeSlot[] = [
        {
          id: '1',
          documentId: 'slot-1',
          start: '2024-12-05T19:00:00+01:00',
          end: '2024-12-05T19:30:00+01:00',
          max_bookings: 4,
        },
      ];

      vi.mocked(sendRequest).mockResolvedValue({ data: mockTimeSlots });

      const result = await loadTimeSlots('booking-1');

      expect(sendRequest).toHaveBeenCalledWith({
        url: '/api/time-slots?populate=*&filters[bookings][documentId]=booking-1',
      });
      expect(result).toEqual(mockTimeSlots);
    });
  });

  describe('createBooking', () => {
    it('should create new booking with contact', async () => {
      const { sendRequest } = await import('$lib/api/client');
      const contact: ContactPerson = {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123',
      };
      const mockBooking: Booking = {
        documentId: 'booking-1',
        contact_person: contact,
        location: {
          street: '',
          house_number: '',
          zip_code: '',
          place: '',
        },
        present_location: '',
        time_slots: [],
        children: [],
        additional_notes: '',
      };

      vi.mocked(sendRequest).mockResolvedValue({ data: mockBooking });

      const result = await createBooking(contact);

      expect(sendRequest).toHaveBeenCalledWith({
        url: '/api/bookings',
        method: 'POST',
        body: {
          data: {
            contact_person: contact,
          },
        },
      });
      expect(result).toEqual(mockBooking);
    });
  });

  describe('updateBookingContact', () => {
    it('should update booking contact', async () => {
      const { sendRequest } = await import('$lib/api/client');
      const contact: ContactPerson = {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123',
      };
      const mockBooking: Booking = {
        documentId: 'booking-1',
        contact_person: contact,
        location: {
          street: '',
          house_number: '',
          zip_code: '',
          place: '',
        },
        present_location: '',
        time_slots: [],
        children: [],
        additional_notes: '',
      };

      vi.mocked(sendRequest).mockResolvedValue({ data: mockBooking });

      const result = await updateBookingContact('booking-1', contact);

      expect(sendRequest).toHaveBeenCalledWith({
        url: '/api/bookings/booking-1',
        method: 'PUT',
        body: {
          data: {
            contact_person: contact,
          },
        },
      });
      expect(result).toEqual(mockBooking);
    });
  });

  describe('updateBookingAddress', () => {
    it('should update booking address', async () => {
      const { sendRequest } = await import('$lib/api/client');
      const location: Location = {
        street: 'Hauptstraße',
        house_number: '123',
        zip_code: '12345',
        place: 'München',
      };
      const mockBooking: Booking = {
        documentId: 'booking-1',
        contact_person: {
          first_name: '',
          last_name: '',
          email: '',
          phone_number: '',
        },
        location,
        present_location: 'Wohnzimmer',
        time_slots: [],
        children: [],
        additional_notes: '',
      };

      vi.mocked(sendRequest).mockResolvedValue({ data: mockBooking });

      const result = await updateBookingAddress('booking-1', location, 'Wohnzimmer');

      expect(sendRequest).toHaveBeenCalledWith({
        url: '/api/bookings/booking-1',
        method: 'PUT',
        body: {
          data: {
            location,
            present_location: 'Wohnzimmer',
          },
        },
      });
      expect(result).toEqual(mockBooking);
    });
  });

  describe('updateBookingTimeSlots', () => {
    it('should update booking time slots', async () => {
      const { sendRequest } = await import('$lib/api/client');
      const timeSlotIds = ['slot-1', 'slot-2', 'slot-3'];
      const mockBooking: Booking = {
        documentId: 'booking-1',
        contact_person: {
          first_name: '',
          last_name: '',
          email: '',
          phone_number: '',
        },
        location: {
          street: '',
          house_number: '',
          zip_code: '',
          place: '',
        },
        present_location: '',
        time_slots: [] as Booking['time_slots'],
        children: [],
        additional_notes: '',
      };

      vi.mocked(sendRequest).mockResolvedValue({ data: mockBooking });

      const result = await updateBookingTimeSlots('booking-1', timeSlotIds);

      expect(sendRequest).toHaveBeenCalledWith({
        url: '/api/bookings/booking-1',
        method: 'PUT',
        body: {
          data: {
            time_slots: timeSlotIds,
          },
        },
      });
      expect(result).toEqual(mockBooking);
    });
  });

  describe('updateBookingChildren', () => {
    it('should update booking children', async () => {
      const { sendRequest } = await import('$lib/api/client');
      const children: Child[] = [
        {
          name: 'Anna',
          identification_trait: 'Blondes Haar',
          speech: 'Gedicht',
        },
      ];
      const mockBooking: Booking = {
        documentId: 'booking-1',
        contact_person: {
          first_name: '',
          last_name: '',
          email: '',
          phone_number: '',
        },
        location: {
          street: '',
          house_number: '',
          zip_code: '',
          place: '',
        },
        present_location: '',
        time_slots: [],
        children,
        additional_notes: 'Notes',
      };

      vi.mocked(sendRequest).mockResolvedValue({ data: mockBooking });

      const result = await updateBookingChildren('booking-1', children, 'Notes');

      expect(sendRequest).toHaveBeenCalledWith({
        url: '/api/bookings/booking-1',
        method: 'PUT',
        body: {
          data: {
            children,
            additional_notes: 'Notes',
          },
        },
      });
      expect(result).toEqual(mockBooking);
    });
  });
});
