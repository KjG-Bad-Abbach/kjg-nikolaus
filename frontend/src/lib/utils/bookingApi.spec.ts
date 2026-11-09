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
import type { Config, Booking, ContactPerson, Location, Child } from '$lib/types/booking';
import { SvelteDate } from 'svelte/reactivity';
import { formatDateTimeRange } from './dateFormat';

// Mock the sendRequest function
vi.mock('$lib/api/client', () => ({
  sendRequest: vi.fn(),
}));

describe('bookingApi', () => {
  beforeEach(() => {
    vi.resetAllMocks();
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
    it('loadBooking_RawSlotRelation_Expect_FormattedSummaryAndDocumentIdentity', async () => {
      // Arrange
      const { sendRequest } = await import('$lib/api/client');
      const slot = {
        id: 42,
        documentId: 'slot-1',
        start: '2024-12-05T19:00:00+01:00',
        end: '2024-12-05T19:30:00+01:00',
      };
      vi.mocked(sendRequest).mockResolvedValue({ data: { time_slots: [slot] } });

      // Act
      const booking = await loadBooking('booking-1');

      // Assert
      expect(booking.time_slots).toEqual([
        {
          ...slot,
          id: 'slot-1',
          label: formatDateTimeRange(new Date(slot.start), new Date(slot.end)),
        },
      ]);
    });

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
    it('loadTimeSlots_MoreThanHundredEntries_Expect_CompleteInventory', async () => {
      // Arrange
      const { sendRequest } = await import('$lib/api/client');
      const rawSlots = Array.from({ length: 101 }, (_, index) => ({
        id: index + 1,
        documentId: `slot-${index + 1}`,
        start: '2026-12-05T18:00:00Z',
        end: '2026-12-05T18:30:00Z',
        available_reservations: 1,
      }));
      const pageSize = 25;
      const pageCount = Math.ceil(rawSlots.length / pageSize);
      for (let page = 1; page <= pageCount; page++) {
        vi.mocked(sendRequest).mockResolvedValueOnce({
          data: rawSlots.slice((page - 1) * pageSize, page * pageSize),
          meta: { pagination: { page, pageSize, pageCount, total: rawSlots.length } },
        });
      }

      // Act
      const slots = await loadTimeSlots([]);

      // Assert
      expect(slots.map((slot) => slot.documentId)).toEqual(rawSlots.map((slot) => slot.documentId));
      expect(sendRequest).toHaveBeenCalledTimes(5);
      expect(sendRequest).toHaveBeenLastCalledWith({
        url: '/api/time-slots?pagination[page]=5&pagination[pageSize]=25',
      });
    });

    it('loadTimeSlots_PaginatedInventory_Expect_AllPagesGloballySortedAndCreditedOnce', async () => {
      // Arrange
      const { sendRequest } = await import('$lib/api/client');
      const rawSlots = [
        {
          id: 1,
          documentId: 'late-slot',
          start: '2026-12-05T20:00:00Z',
          end: '2026-12-05T20:30:00Z',
          available_reservations: 2,
        },
        {
          id: 2,
          documentId: 'early-slot',
          start: '2026-12-05T18:00:00Z',
          end: '2026-12-05T18:30:00Z',
          available_reservations: 0,
        },
        {
          id: 3,
          documentId: 'middle-slot',
          start: '2026-12-05T19:00:00Z',
          end: '2026-12-05T19:30:00Z',
          available_reservations: -1,
        },
      ];
      for (const [index, slot] of rawSlots.entries()) {
        vi.mocked(sendRequest).mockResolvedValueOnce({
          data: [slot],
          meta: { pagination: { page: index + 1, pageSize: 1, pageCount: 3, total: 3 } },
        });
      }

      // Act
      const slots = await loadTimeSlots(['early-slot', 'middle-slot']);

      // Assert
      expect(vi.mocked(sendRequest).mock.calls).toEqual([
        [{ url: '/api/time-slots' }],
        [{ url: '/api/time-slots?pagination[page]=2&pagination[pageSize]=1' }],
        [{ url: '/api/time-slots?pagination[page]=3&pagination[pageSize]=1' }],
      ]);
      expect(
        slots.map(({ id, available_reservations }) => ({ id, available_reservations })),
      ).toEqual([
        { id: 'early-slot', available_reservations: 1 },
        { id: 'middle-slot', available_reservations: 0 },
        { id: 'late-slot', available_reservations: 2 },
      ]);
      for (const slot of slots) {
        expect(slot.label).toBe(formatDateTimeRange(new Date(slot.start), new Date(slot.end)));
      }
      expect(rawSlots.map((slot) => slot.available_reservations)).toEqual([2, 0, -1]);
    });

    it('loadTimeSlots_LaterPageFailure_Expect_NoPartialInventoryReturned', async () => {
      // Arrange
      const { sendRequest } = await import('$lib/api/client');
      const error = { message: 'Inventory unavailable' };
      vi.mocked(sendRequest)
        .mockResolvedValueOnce({
          data: [],
          meta: { pagination: { page: 1, pageSize: 25, pageCount: 2, total: 26 } },
        })
        .mockRejectedValueOnce(error);

      // Act
      const result = loadTimeSlots([]);

      // Assert
      await expect(result).rejects.toBe(error);
    });

    it('loadTimeSlots_RawInventory_Expect_DocumentIdentityLabelsAndChronologicalOrder', async () => {
      // Arrange
      const { sendRequest } = await import('$lib/api/client');
      const mockTimeSlots = [
        {
          id: 42,
          documentId: 'slot-1',
          start: '2024-12-05T19:00:00+01:00',
          end: '2024-12-05T19:30:00+01:00',
          max_bookings: 4,
          max_reservations: 12,
          available_reservations: 0,
        },
        {
          id: 91,
          documentId: 'slot-2',
          start: '2024-12-05T18:00:00+01:00',
          end: '2024-12-05T18:30:00+01:00',
          max_bookings: 4,
          max_reservations: 12,
          available_reservations: 5,
        },
      ];

      vi.mocked(sendRequest).mockResolvedValue({ data: mockTimeSlots });

      // Act
      const result = await loadTimeSlots([]);

      // Assert
      expect(sendRequest).toHaveBeenCalledWith({
        url: '/api/time-slots',
      });
      expect(result).toEqual(
        [...mockTimeSlots].reverse().map((slot) => ({
          ...slot,
          id: slot.documentId,
          label: formatDateTimeRange(new Date(slot.start), new Date(slot.end)),
        })),
      );
      expect(mockTimeSlots[0].id).toBe(42);
      expect(sendRequest).toHaveBeenCalledOnce();
    });

    it.each([
      { rawCapacity: -1, creditedCapacity: 0 },
      { rawCapacity: 0, creditedCapacity: 1 },
      { rawCapacity: 5, creditedCapacity: 6 },
    ])(
      'loadTimeSlots_OwnReservation%j_Expect_AllInventoryWithOwnCapacityCredit',
      async ({ rawCapacity, creditedCapacity }) => {
        // Arrange
        const { sendRequest } = await import('$lib/api/client');
        const mockTimeSlots = [
          {
            id: 42,
            documentId: 'slot-1',
            start: '2024-12-05T19:00:00+01:00',
            end: '2024-12-05T19:30:00+01:00',
            max_bookings: 4,
            max_reservations: 12,
            available_reservations: rawCapacity,
          },
          {
            id: 77,
            documentId: 'slot-2',
            start: '2024-12-05T20:00:00+01:00',
            end: '2024-12-05T20:30:00+01:00',
            max_bookings: 4,
            max_reservations: 12,
            available_reservations: 0,
          },
        ];

        vi.mocked(sendRequest).mockResolvedValue({ data: mockTimeSlots });

        // Act
        const result = await loadTimeSlots(['slot-1']);
        const reloaded = await loadTimeSlots(['slot-1']);

        // Assert
        expect(sendRequest).toHaveBeenCalledWith({
          url: '/api/time-slots',
        });
        expect(result[0]).toMatchObject({ id: 'slot-1', available_reservations: creditedCapacity });
        expect(result[1]).toMatchObject({ id: 'slot-2', available_reservations: 0 });
        expect(reloaded[0].available_reservations).toBe(creditedCapacity);
        expect(mockTimeSlots[0].available_reservations).toBe(rawCapacity);
      },
    );
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
    it('updateBookingChildren_ExistingChild_Expect_OnlyEditableFieldsSent', async () => {
      // Arrange
      const { sendRequest } = await import('$lib/api/client');
      const children: Child[] = [
        {
          id: 'existing-child',
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

      // Act
      const result = await updateBookingChildren('booking-1', children, 'Notes');

      // Assert
      expect(sendRequest).toHaveBeenCalledWith({
        url: '/api/bookings/booking-1',
        method: 'PUT',
        body: {
          data: {
            children: [{ name: 'Anna', identification_trait: 'Blondes Haar', speech: 'Gedicht' }],
            additional_notes: 'Notes',
          },
        },
      });
      expect(result).toEqual(mockBooking);
    });
  });
});
