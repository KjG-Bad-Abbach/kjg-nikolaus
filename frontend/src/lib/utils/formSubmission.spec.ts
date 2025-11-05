import { describe, expect, it, vi, beforeEach } from 'vitest';
import { submitContact, submitAddress, submitTimeSlots, submitChildren } from './formSubmission';
import type { UIStore } from '$lib/stores/uiStore.svelte';
import type { BookingStore } from '$lib/stores/bookingStore.svelte';
import type { ValidationStore } from '$lib/stores/validationStore.svelte';
import type { ContactPerson, Location, Child, Booking, ApiError } from '$lib/types/booking';

// Mock the bookingApi module
vi.mock('./bookingApi', () => ({
  createBooking: vi.fn(),
  updateBookingContact: vi.fn(),
  updateBookingAddress: vi.fn(),
  updateBookingTimeSlots: vi.fn(),
  updateBookingChildren: vi.fn(),
}));

describe('formSubmission', () => {
  // Create mock stores
  let mockUIStore: UIStore;
  let mockBookingStore: BookingStore;
  let mockValidationStore: ValidationStore;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock UI Store
    mockUIStore = {
      isLoading: false,
      setLoading: vi.fn(),
      setError: vi.fn(),
    } as unknown as UIStore;

    // Mock Booking Store
    mockBookingStore = {
      updateFromDatabase: vi.fn(),
    } as unknown as BookingStore;

    // Mock Validation Store
    mockValidationStore = {
      messages: {},
      clearAll: vi.fn(),
      setMessage: vi.fn(),
    } as unknown as ValidationStore;
  });

  describe('submitContact', () => {
    const validContact: ContactPerson = {
      first_name: 'Max',
      last_name: 'Mustermann',
      email: 'max@example.com',
      phone_number: '+49 123 456789',
    };

    it('should successfully create new booking', async () => {
      const { createBooking } = await import('./bookingApi');
      const mockBooking: Booking = {
        documentId: 'booking-1',
        contact_person: validContact,
        location: { street: '', house_number: '', zip_code: '', place: '' },
        present_location: '',
        time_slots: [],
        children: [],
        additional_notes: '',
      };

      vi.mocked(createBooking).mockResolvedValue(mockBooking);

      const result = await submitContact({
        contact: { ...validContact },
        bookingId: null,
        uiStore: mockUIStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
      });

      expect(mockUIStore.setLoading).toHaveBeenCalledWith(true);
      expect(mockUIStore.setLoading).toHaveBeenCalledWith(false);
      expect(mockUIStore.setError).toHaveBeenCalledWith(null);
      expect(mockValidationStore.clearAll).toHaveBeenCalled();
      expect(createBooking).toHaveBeenCalled();
      expect(result.bookingId).toBe('booking-1');
      expect(result.isNewBooking).toBe(true);
      expect(mockBookingStore.updateFromDatabase).toHaveBeenCalled();
    });

    it('should successfully update existing booking', async () => {
      const { updateBookingContact } = await import('./bookingApi');
      const mockBooking: Booking = {
        documentId: 'booking-1',
        contact_person: validContact,
        location: { street: '', house_number: '', zip_code: '', place: '' },
        present_location: '',
        time_slots: [],
        children: [],
        additional_notes: '',
      };

      vi.mocked(updateBookingContact).mockResolvedValue(mockBooking);

      const result = await submitContact({
        contact: { ...validContact },
        bookingId: 'booking-1',
        uiStore: mockUIStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
      });

      expect(updateBookingContact).toHaveBeenCalledWith('booking-1', expect.any(Object));
      expect(result.bookingId).toBe('booking-1');
      expect(result.isNewBooking).toBe(false);
      expect(mockBookingStore.updateFromDatabase).not.toHaveBeenCalled();
    });

    it('should return null when validation fails', async () => {
      const invalidContact: ContactPerson = {
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
      };

      const result = await submitContact({
        contact: invalidContact,
        bookingId: null,
        uiStore: mockUIStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
      });

      expect(result.bookingId).toBeNull();
      expect(result.isNewBooking).toBe(false);
      expect(mockValidationStore.setMessage).toHaveBeenCalled();
    });

    it('should not submit when already loading', async () => {
      mockUIStore.isLoading = true;

      const result = await submitContact({
        contact: validContact,
        bookingId: null,
        uiStore: mockUIStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
      });

      expect(result.bookingId).toBeNull();
      expect(mockUIStore.setLoading).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      const { createBooking } = await import('./bookingApi');
      const apiError: ApiError = {
        message: 'Validation failed',
        body: {
          error: {
            details: {
              errors: [{ path: ['contact_person', 'email'], message: 'Invalid email' }],
            },
          },
        },
      };

      vi.mocked(createBooking).mockRejectedValue(apiError);

      const result = await submitContact({
        contact: validContact,
        bookingId: null,
        uiStore: mockUIStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
      });

      expect(result.bookingId).toBeNull();
      expect(mockUIStore.setError).toHaveBeenCalledWith(apiError);
      expect(mockValidationStore.setMessage).toHaveBeenCalledWith(
        'booking.contact_person.email',
        'Invalid email',
      );
    });

    it('should trim contact fields before validation', async () => {
      const { createBooking } = await import('./bookingApi');
      const contactWithSpaces: ContactPerson = {
        first_name: '  Max  ',
        last_name: '  Mustermann  ',
        email: '  max@example.com  ',
        phone_number: '  +49 123  ',
      };

      vi.mocked(createBooking).mockResolvedValue({
        documentId: 'booking-1',
      } as Booking);

      await submitContact({
        contact: contactWithSpaces,
        bookingId: null,
        uiStore: mockUIStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
      });

      expect(contactWithSpaces.first_name).toBe('Max');
      expect(contactWithSpaces.last_name).toBe('Mustermann');
      expect(contactWithSpaces.email).toBe('max@example.com');
      expect(contactWithSpaces.phone_number).toBe('+49 123');
    });
  });

  describe('submitAddress', () => {
    const validLocation: Location = {
      street: 'Hauptstraße',
      house_number: '123',
      zip_code: '12345',
      place: 'München',
    };

    it('should successfully submit address', async () => {
      const { updateBookingAddress } = await import('./bookingApi');
      vi.mocked(updateBookingAddress).mockResolvedValue({} as Booking);

      const result = await submitAddress({
        location: { ...validLocation },
        presentLocation: 'Wohnzimmer',
        bookingId: 'booking-1',
        canEditRoutePlanning: true,
        uiStore: mockUIStore,
        validationStore: mockValidationStore,
      });

      expect(result).toBe(true);
      expect(updateBookingAddress).toHaveBeenCalledWith(
        'booking-1',
        expect.any(Object),
        'Wohnzimmer',
      );
      expect(mockUIStore.setLoading).toHaveBeenCalledWith(false);
    });

    it('should return false when no booking ID', async () => {
      const result = await submitAddress({
        location: validLocation,
        presentLocation: 'Wohnzimmer',
        bookingId: null,
        canEditRoutePlanning: true,
        uiStore: mockUIStore,
        validationStore: mockValidationStore,
      });

      expect(result).toBe(false);
    });

    it('should return false when validation fails', async () => {
      const result = await submitAddress({
        location: { street: '', house_number: '', zip_code: '', place: '' },
        presentLocation: '',
        bookingId: 'booking-1',
        canEditRoutePlanning: true,
        uiStore: mockUIStore,
        validationStore: mockValidationStore,
      });

      expect(result).toBe(false);
      expect(mockValidationStore.setMessage).toHaveBeenCalled();
    });

    it('should not validate location fields when canEditRoutePlanning is false', async () => {
      const { updateBookingAddress } = await import('./bookingApi');
      vi.mocked(updateBookingAddress).mockResolvedValue({} as Booking);

      const result = await submitAddress({
        location: { street: '', house_number: '', zip_code: '', place: '' },
        presentLocation: 'Wohnzimmer',
        bookingId: 'booking-1',
        canEditRoutePlanning: false,
        uiStore: mockUIStore,
        validationStore: mockValidationStore,
      });

      expect(result).toBe(true);
    });

    it('should handle API errors', async () => {
      const { updateBookingAddress } = await import('./bookingApi');
      const apiError: ApiError = {
        message: 'Error',
        body: { error: { details: { errors: [] } } },
      };
      vi.mocked(updateBookingAddress).mockRejectedValue(apiError);

      const result = await submitAddress({
        location: validLocation,
        presentLocation: 'Wohnzimmer',
        bookingId: 'booking-1',
        canEditRoutePlanning: true,
        uiStore: mockUIStore,
        validationStore: mockValidationStore,
      });

      expect(result).toBe(false);
      expect(mockUIStore.setError).toHaveBeenCalledWith(apiError);
    });

    it('should extract and set validation errors from API response', async () => {
      const { updateBookingAddress } = await import('./bookingApi');
      const apiError: ApiError = {
        message: 'Validation failed',
        body: {
          error: {
            details: {
              errors: [
                { path: ['location', 'zip_code'], message: 'Invalid zip code' },
                { path: ['present_location'], message: 'Required field' },
              ],
            },
          },
        },
      };
      vi.mocked(updateBookingAddress).mockRejectedValue(apiError);

      const result = await submitAddress({
        location: validLocation,
        presentLocation: 'Wohnzimmer',
        bookingId: 'booking-1',
        canEditRoutePlanning: true,
        uiStore: mockUIStore,
        validationStore: mockValidationStore,
      });

      expect(result).toBe(false);
      expect(mockValidationStore.setMessage).toHaveBeenCalledWith(
        'booking.location.zip_code',
        'Invalid zip code',
      );
      expect(mockValidationStore.setMessage).toHaveBeenCalledWith(
        'booking.present_location',
        'Required field',
      );
    });
  });

  describe('submitTimeSlots', () => {
    it('should successfully submit time slots', async () => {
      const { updateBookingTimeSlots } = await import('./bookingApi');
      vi.mocked(updateBookingTimeSlots).mockResolvedValue({} as Booking);

      const result = await submitTimeSlots({
        selectedTimeSlotIds: ['id1', 'id2', 'id3'],
        bookingId: 'booking-1',
        maxTimeSlots: 3,
        uiStore: mockUIStore,
        validationStore: mockValidationStore,
      });

      expect(result).toBe(true);
      expect(updateBookingTimeSlots).toHaveBeenCalledWith('booking-1', ['id1', 'id2', 'id3']);
    });

    it('should return false when no booking ID', async () => {
      const result = await submitTimeSlots({
        selectedTimeSlotIds: ['id1', 'id2', 'id3'],
        bookingId: null,
        maxTimeSlots: 3,
        uiStore: mockUIStore,
        validationStore: mockValidationStore,
      });

      expect(result).toBe(false);
    });

    it('should return false when not enough slots selected', async () => {
      const result = await submitTimeSlots({
        selectedTimeSlotIds: ['id1'],
        bookingId: 'booking-1',
        maxTimeSlots: 3,
        uiStore: mockUIStore,
        validationStore: mockValidationStore,
      });

      expect(result).toBe(false);
      expect(mockValidationStore.setMessage).toHaveBeenCalledWith(
        'booking.time_slots',
        'Bitte wähle 3 Zeitslots aus.',
      );
    });

    it('should handle API errors', async () => {
      const { updateBookingTimeSlots } = await import('./bookingApi');
      const apiError: ApiError = { message: 'Error' };
      vi.mocked(updateBookingTimeSlots).mockRejectedValue(apiError);

      const result = await submitTimeSlots({
        selectedTimeSlotIds: ['id1', 'id2', 'id3'],
        bookingId: 'booking-1',
        maxTimeSlots: 3,
        uiStore: mockUIStore,
        validationStore: mockValidationStore,
      });

      expect(result).toBe(false);
      expect(mockUIStore.setError).toHaveBeenCalledWith(apiError);
    });
  });

  describe('submitChildren', () => {
    const validChild: Child = {
      name: 'Anna',
      identification_trait: 'Blondes Haar',
      speech: 'Gedicht',
    };

    it('should successfully submit children', async () => {
      const { updateBookingChildren } = await import('./bookingApi');
      vi.mocked(updateBookingChildren).mockResolvedValue({} as Booking);

      const result = await submitChildren({
        children: [{ ...validChild }],
        additionalNotes: 'Notes',
        bookingId: 'booking-1',
        uiStore: mockUIStore,
        validationStore: mockValidationStore,
      });

      expect(result).toBe(true);
      expect(updateBookingChildren).toHaveBeenCalledWith('booking-1', expect.any(Array), 'Notes');
    });

    it('should return false when no booking ID', async () => {
      const result = await submitChildren({
        children: [validChild],
        additionalNotes: '',
        bookingId: null,
        uiStore: mockUIStore,
        validationStore: mockValidationStore,
      });

      expect(result).toBe(false);
    });

    it('should return false when no children provided', async () => {
      const result = await submitChildren({
        children: [],
        additionalNotes: '',
        bookingId: 'booking-1',
        uiStore: mockUIStore,
        validationStore: mockValidationStore,
      });

      expect(result).toBe(false);
      expect(mockValidationStore.setMessage).toHaveBeenCalledWith(
        'booking.children',
        'Bitte füge mindestens ein Kind hinzu.',
      );
    });

    it('should return false when child fields are invalid', async () => {
      const invalidChild: Child = {
        name: '',
        identification_trait: '',
        speech: '',
      };

      const result = await submitChildren({
        children: [invalidChild],
        additionalNotes: '',
        bookingId: 'booking-1',
        uiStore: mockUIStore,
        validationStore: mockValidationStore,
      });

      expect(result).toBe(false);
      expect(mockValidationStore.setMessage).toHaveBeenCalled();
    });

    it('should trim child fields before submission', async () => {
      const { updateBookingChildren } = await import('./bookingApi');
      vi.mocked(updateBookingChildren).mockResolvedValue({} as Booking);

      const childWithSpaces: Child = {
        name: '  Anna  ',
        identification_trait: '  Blondes Haar  ',
        speech: '  Gedicht  ',
      };

      await submitChildren({
        children: [childWithSpaces],
        additionalNotes: '  Notes  ',
        bookingId: 'booking-1',
        uiStore: mockUIStore,
        validationStore: mockValidationStore,
      });

      expect(childWithSpaces.name).toBe('Anna');
      expect(childWithSpaces.identification_trait).toBe('Blondes Haar');
      expect(childWithSpaces.speech).toBe('Gedicht');
      expect(updateBookingChildren).toHaveBeenCalledWith('booking-1', expect.any(Array), 'Notes');
    });

    it('should handle API errors', async () => {
      const { updateBookingChildren } = await import('./bookingApi');
      const apiError: ApiError = { message: 'Error' };
      vi.mocked(updateBookingChildren).mockRejectedValue(apiError);

      const result = await submitChildren({
        children: [validChild],
        additionalNotes: '',
        bookingId: 'booking-1',
        uiStore: mockUIStore,
        validationStore: mockValidationStore,
      });

      expect(result).toBe(false);
      expect(mockUIStore.setError).toHaveBeenCalledWith(apiError);
    });
  });
});
