import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  submitContactDetails,
  submitAddressStep,
  submitTimeSlotsStep,
  submitChildrenStep,
  type SubmitContext,
} from './submitHandlers';
import * as formSubmission from '$lib/utils/formSubmission';

// Mock the formSubmission utility
vi.mock('$lib/utils/formSubmission', async () => {
  const actual = await vi.importActual('$lib/utils/formSubmission');
  return {
    ...actual,
    submitContact: vi.fn(),
    submitAddress: vi.fn(),
    submitTimeSlots: vi.fn(),
    submitChildren: vi.fn(),
  };
});

describe('submitHandlers', () => {
  let mockContext: SubmitContext;
  let mockEvent: Event;

  beforeEach(() => {
    vi.clearAllMocks();

    mockEvent = {
      preventDefault: vi.fn(),
    } as unknown as Event;

    mockContext = {
      uiStore: {
        bookingId: 'test-booking-123',
        setBookingId: vi.fn(),
        setView: vi.fn(),
        setStep: vi.fn(),
      } as unknown as SubmitContext['uiStore'],
      bookingStore: {
        booking: {
          contact_person: {
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@example.com',
            phone: '1234567890',
          },
          location: {
            street_name: 'Main St',
            house_number: '123',
            postal_code: '12345',
            city: 'Test City',
          },
          present_location: 'Wohnung',
          children: [{ first_name: 'Alice', age: 8 }],
          additional_notes: 'Test notes',
        },
        selectedTimeSlotIds: ['slot1', 'slot2'],
      } as unknown as SubmitContext['bookingStore'],
      validationStore: {} as unknown as SubmitContext['validationStore'],
      optionsStore: {
        max_time_slots: 3,
      } as unknown as SubmitContext['optionsStore'],
      derivedStores: {
        canEditRoutePlanning: true,
      } as unknown as SubmitContext['derivedStores'],
      reloadBooking: vi.fn(),
    };
  });

  describe('submitContactDetails', () => {
    it('should prevent default event and submit contact', async () => {
      vi.mocked(formSubmission.submitContact).mockResolvedValue({
        bookingId: 'new-booking-456',
        isNewBooking: true,
      });

      await submitContactDetails(mockEvent, mockContext);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(formSubmission.submitContact).toHaveBeenCalledWith({
        contact: mockContext.bookingStore.booking.contact_person,
        bookingId: mockContext.uiStore.bookingId,
        uiStore: mockContext.uiStore,
        bookingStore: mockContext.bookingStore,
        validationStore: mockContext.validationStore,
      });
    });

    it('should handle new booking creation', async () => {
      vi.mocked(formSubmission.submitContact).mockResolvedValue({
        bookingId: 'new-booking-456',
        isNewBooking: true,
      });

      await submitContactDetails(mockEvent, mockContext);

      expect(mockContext.uiStore.setBookingId).toHaveBeenCalledWith('new-booking-456');
      expect(mockContext.uiStore.setView).toHaveBeenCalledWith('steps');
      expect(mockContext.reloadBooking).not.toHaveBeenCalled();
      expect(mockContext.uiStore.setStep).toHaveBeenCalledWith(1);
    });

    it('should handle existing booking update', async () => {
      vi.mocked(formSubmission.submitContact).mockResolvedValue({
        bookingId: 'existing-booking-789',
        isNewBooking: false,
      });

      await submitContactDetails(mockEvent, mockContext);

      expect(mockContext.uiStore.setBookingId).toHaveBeenCalledWith('existing-booking-789');
      expect(mockContext.uiStore.setView).toHaveBeenCalledWith('steps');
      expect(mockContext.reloadBooking).toHaveBeenCalled();
      expect(mockContext.uiStore.setStep).toHaveBeenCalledWith(1);
    });

    it('should not proceed when bookingId is not returned', async () => {
      vi.mocked(formSubmission.submitContact).mockResolvedValue({
        bookingId: null,
        isNewBooking: false,
      });

      await submitContactDetails(mockEvent, mockContext);

      expect(mockContext.uiStore.setBookingId).not.toHaveBeenCalled();
      expect(mockContext.uiStore.setStep).not.toHaveBeenCalled();
    });
  });

  describe('submitAddressStep', () => {
    it('should prevent default event and submit address', async () => {
      vi.mocked(formSubmission.submitAddress).mockResolvedValue(true);

      await submitAddressStep(mockEvent, mockContext);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(formSubmission.submitAddress).toHaveBeenCalledWith({
        location: mockContext.bookingStore.booking.location,
        presentLocation: mockContext.bookingStore.booking.present_location,
        bookingId: mockContext.uiStore.bookingId,
        canEditRoutePlanning: mockContext.derivedStores.canEditRoutePlanning,
        uiStore: mockContext.uiStore,
        validationStore: mockContext.validationStore,
      });
    });

    it('should reload booking and move to next step on success', async () => {
      vi.mocked(formSubmission.submitAddress).mockResolvedValue(true);

      await submitAddressStep(mockEvent, mockContext);

      expect(mockContext.reloadBooking).toHaveBeenCalled();
      expect(mockContext.uiStore.setStep).toHaveBeenCalledWith(2);
    });

    it('should not proceed on failure', async () => {
      vi.mocked(formSubmission.submitAddress).mockResolvedValue(false);

      await submitAddressStep(mockEvent, mockContext);

      expect(mockContext.reloadBooking).not.toHaveBeenCalled();
      expect(mockContext.uiStore.setStep).not.toHaveBeenCalled();
    });
  });

  describe('submitTimeSlotsStep', () => {
    it('should prevent default event and submit time slots', async () => {
      vi.mocked(formSubmission.submitTimeSlots).mockResolvedValue(true);

      await submitTimeSlotsStep(mockEvent, mockContext);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(formSubmission.submitTimeSlots).toHaveBeenCalledWith({
        selectedTimeSlotIds: mockContext.bookingStore.selectedTimeSlotIds,
        bookingId: mockContext.uiStore.bookingId,
        maxTimeSlots: mockContext.optionsStore.max_time_slots,
        uiStore: mockContext.uiStore,
        validationStore: mockContext.validationStore,
      });
    });

    it('should reload booking and move to next step on success', async () => {
      vi.mocked(formSubmission.submitTimeSlots).mockResolvedValue(true);

      await submitTimeSlotsStep(mockEvent, mockContext);

      expect(mockContext.reloadBooking).toHaveBeenCalled();
      expect(mockContext.uiStore.setStep).toHaveBeenCalledWith(3);
    });

    it('should not proceed on failure', async () => {
      vi.mocked(formSubmission.submitTimeSlots).mockResolvedValue(false);

      await submitTimeSlotsStep(mockEvent, mockContext);

      expect(mockContext.reloadBooking).not.toHaveBeenCalled();
      expect(mockContext.uiStore.setStep).not.toHaveBeenCalled();
    });
  });

  describe('submitChildrenStep', () => {
    it('should prevent default event and submit children', async () => {
      vi.mocked(formSubmission.submitChildren).mockResolvedValue(true);

      await submitChildrenStep(mockEvent, mockContext);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(formSubmission.submitChildren).toHaveBeenCalledWith({
        children: mockContext.bookingStore.booking.children,
        additionalNotes: mockContext.bookingStore.booking.additional_notes,
        bookingId: mockContext.uiStore.bookingId,
        uiStore: mockContext.uiStore,
        validationStore: mockContext.validationStore,
      });
    });

    it('should reload booking and move to summary step on success', async () => {
      vi.mocked(formSubmission.submitChildren).mockResolvedValue(true);

      await submitChildrenStep(mockEvent, mockContext);

      expect(mockContext.reloadBooking).toHaveBeenCalled();
      expect(mockContext.uiStore.setStep).toHaveBeenCalledWith(4);
    });

    it('should not proceed on failure', async () => {
      vi.mocked(formSubmission.submitChildren).mockResolvedValue(false);

      await submitChildrenStep(mockEvent, mockContext);

      expect(mockContext.reloadBooking).not.toHaveBeenCalled();
      expect(mockContext.uiStore.setStep).not.toHaveBeenCalled();
    });
  });
});
