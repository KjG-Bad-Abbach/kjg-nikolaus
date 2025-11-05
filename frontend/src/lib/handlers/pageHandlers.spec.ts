import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchTimeSlots,
  reloadBooking,
  handleStepChange,
  handleStart,
  handleEditContact,
  handleEditAddress,
  handleEditTimeSlots,
  handleEditChildren,
  type StoreContext,
} from './pageHandlers';
import * as bookingInit from '$lib/utils/bookingInit';

// Mock the bookingInit utility
vi.mock('$lib/utils/bookingInit', async () => {
  const actual = await vi.importActual('$lib/utils/bookingInit');
  return {
    ...actual,
    fetchAndUpdateTimeSlots: vi.fn(),
    loadBookingData: vi.fn(),
    handleStepChange: vi.fn(),
  };
});

describe('pageHandlers', () => {
  let mockContext: StoreContext;

  beforeEach(() => {
    vi.clearAllMocks();

    mockContext = {
      uiStore: {
        bookingId: 'test-booking-123',
        setView: vi.fn(),
        setStep: vi.fn(),
        canJumpToAnyStep: true,
      } as unknown as StoreContext['uiStore'],
      bookingStore: {
        hasChanges: vi.fn().mockReturnValue(false),
      } as unknown as StoreContext['bookingStore'],
      validationStore: {} as unknown as StoreContext['validationStore'],
      optionsStore: {} as unknown as StoreContext['optionsStore'],
      derivedStores: {} as unknown as StoreContext['derivedStores'],
    };
  });

  describe('fetchTimeSlots', () => {
    it('should call fetchAndUpdateTimeSlots with correct parameters', async () => {
      const bookingId = 'test-booking-123';
      const bookingStore = mockContext.bookingStore;
      const uiStore = mockContext.uiStore;

      await fetchTimeSlots(bookingId, bookingStore, uiStore);

      expect(bookingInit.fetchAndUpdateTimeSlots).toHaveBeenCalledWith(
        bookingId,
        bookingStore,
        uiStore,
      );
    });

    it('should handle null booking ID', async () => {
      await fetchTimeSlots(null, mockContext.bookingStore, mockContext.uiStore);

      expect(bookingInit.fetchAndUpdateTimeSlots).toHaveBeenCalledWith(
        null,
        mockContext.bookingStore,
        mockContext.uiStore,
      );
    });
  });

  describe('reloadBooking', () => {
    it('should reload booking data when bookingId exists', async () => {
      await reloadBooking(mockContext);

      expect(bookingInit.loadBookingData).toHaveBeenCalledWith({
        bookingId: 'test-booking-123',
        uiStore: mockContext.uiStore,
        optionsStore: mockContext.optionsStore,
        bookingStore: mockContext.bookingStore,
        validationStore: mockContext.validationStore,
        derivedStores: mockContext.derivedStores,
      });
    });

    it('should not reload when bookingId is null', async () => {
      mockContext.uiStore.bookingId = null;

      await reloadBooking(mockContext);

      expect(bookingInit.loadBookingData).not.toHaveBeenCalled();
    });

    it('should not reload when bookingId is empty string', async () => {
      mockContext.uiStore.bookingId = '';

      await reloadBooking(mockContext);

      expect(bookingInit.loadBookingData).not.toHaveBeenCalled();
    });
  });

  describe('handleStepChange', () => {
    it('should call utility handleStepChange with all parameters', async () => {
      const newStep = 2;
      const canJumpToAnyStep = true;
      const hasChanges = false;
      const fetchTimeSlotsCallback = vi.fn();

      await handleStepChange(
        newStep,
        canJumpToAnyStep,
        hasChanges,
        mockContext.bookingStore,
        mockContext.validationStore,
        mockContext.uiStore,
        fetchTimeSlotsCallback,
      );

      expect(bookingInit.handleStepChange).toHaveBeenCalledWith(
        newStep,
        canJumpToAnyStep,
        hasChanges,
        mockContext.bookingStore,
        mockContext.validationStore,
        mockContext.uiStore,
        fetchTimeSlotsCallback,
      );
    });

    it('should handle step change when canJumpToAnyStep is false', async () => {
      const fetchTimeSlotsCallback = vi.fn();

      await handleStepChange(
        3,
        false,
        true,
        mockContext.bookingStore,
        mockContext.validationStore,
        mockContext.uiStore,
        fetchTimeSlotsCallback,
      );

      expect(bookingInit.handleStepChange).toHaveBeenCalledWith(
        3,
        false,
        true,
        mockContext.bookingStore,
        mockContext.validationStore,
        mockContext.uiStore,
        fetchTimeSlotsCallback,
      );
    });
  });

  describe('handleStart', () => {
    it('should set view to steps', () => {
      handleStart(mockContext.uiStore);

      expect(mockContext.uiStore.setView).toHaveBeenCalledWith('steps');
    });
  });

  describe('handleEditContact', () => {
    it('should set step to 0', () => {
      handleEditContact(mockContext.uiStore);

      expect(mockContext.uiStore.setStep).toHaveBeenCalledWith(0);
    });
  });

  describe('handleEditAddress', () => {
    it('should set step to 1', () => {
      handleEditAddress(mockContext.uiStore);

      expect(mockContext.uiStore.setStep).toHaveBeenCalledWith(1);
    });
  });

  describe('handleEditTimeSlots', () => {
    it('should set step to 2', () => {
      handleEditTimeSlots(mockContext.uiStore);

      expect(mockContext.uiStore.setStep).toHaveBeenCalledWith(2);
    });
  });

  describe('handleEditChildren', () => {
    it('should set step to 3', () => {
      handleEditChildren(mockContext.uiStore);

      expect(mockContext.uiStore.setStep).toHaveBeenCalledWith(3);
    });
  });
});
