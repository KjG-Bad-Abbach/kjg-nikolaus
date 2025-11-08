import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  initializeBooking,
  loadBookingData,
  fetchAndUpdateTimeSlots,
  handleStepChange,
} from './bookingInit';
import type { UIStore } from '$lib/stores/uiStore.svelte';
import type { OptionsStore } from '$lib/stores/optionsStore.svelte';
import type { BookingStore } from '$lib/stores/bookingStore.svelte';
import type { ValidationStore } from '$lib/stores/validationStore.svelte';
import type { DerivedStores, Config, Booking, TimeSlot, ApiError } from '$lib/types/booking';
import { SvelteDate } from 'svelte/reactivity';

// Mock the bookingApi module
vi.mock('./bookingApi', () => ({
  loadConfig: vi.fn(),
  loadBooking: vi.fn(),
  loadTimeSlots: vi.fn(),
}));

// Mock unsavedChanges module
vi.mock('./unsavedChanges', () => ({
  registerCheckUnsavedChanges: vi.fn(),
}));

describe('bookingInit', () => {
  let mockUIStore: UIStore;
  let mockOptionsStore: OptionsStore;
  let mockBookingStore: BookingStore;
  let mockValidationStore: ValidationStore;
  let mockDerivedStores: DerivedStores;
  let originalWindow: typeof window;

  beforeEach(() => {
    vi.clearAllMocks();

    // Save original window
    originalWindow = global.window;

    // Mock UI Store
    mockUIStore = {
      isLoading: false,
      bookingId: null,
      setLoading: vi.fn(),
      setError: vi.fn(),
      setView: vi.fn(),
      setBookingId: vi.fn(),
      setCanJumpToAnyStep: vi.fn(),
      setStep: vi.fn(),
      updateStep: vi.fn(),
    } as unknown as UIStore;

    // Mock Options Store
    mockOptionsStore = {
      id: null,
      max_time_slots: 3,
      update: vi.fn(),
    } as unknown as OptionsStore;

    // Mock Booking Store
    mockBookingStore = {
      reset: vi.fn(),
      updateFromDatabase: vi.fn(),
      setAvailableTimeSlots: vi.fn(),
      setSelectedTimeSlotIds: vi.fn(),
      hasChanges: vi.fn(() => false),
      revertToDatabase: vi.fn(),
    } as unknown as BookingStore;

    // Mock Validation Store
    mockValidationStore = {
      clearAll: vi.fn(),
    } as unknown as ValidationStore;

    // Mock Derived Stores
    mockDerivedStores = {
      canEditRoutePlanning: true,
      canEditAnything: true,
      isRoutePlanningFilled: true,
      isEverythingFilled: true,
    };
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  describe('initializeBooking', () => {
    it('should load config and set intro view when introduction text exists', async () => {
      const { loadConfig } = await import('./bookingApi');
      const mockConfig: Config = {
        id: '1',
        documentId: 'config-1',
        route_planning_deadline: new SvelteDate('2024-12-01'),
        final_deadline: new SvelteDate('2024-12-05'),
        max_time_slots: 3,
        show_search_for_time_slots: false,
        introduction_text: [{ type: 'paragraph', children: [{ type: 'text', text: 'Hello' }] }],
        privacy_policy_link: null,
        legal_notice_link: null,
      };

      vi.mocked(loadConfig).mockResolvedValue(mockConfig);

      // Mock window with no booking ID
      global.window = {
        location: { search: '' },
      } as unknown as Window & typeof globalThis;

      await initializeBooking({
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
        derivedStores: mockDerivedStores,
      });

      expect(mockUIStore.setLoading).toHaveBeenCalledWith(true);
      expect(mockUIStore.setLoading).toHaveBeenCalledWith(false);
      expect(mockOptionsStore.update).toHaveBeenCalledWith(mockConfig);
      expect(mockUIStore.setView).toHaveBeenCalledWith('intro');
    });

    it('should set steps view when no introduction text', async () => {
      const { loadConfig } = await import('./bookingApi');
      const mockConfig: Config = {
        id: '1',
        documentId: 'config-1',
        route_planning_deadline: new SvelteDate('2024-12-01'),
        final_deadline: new SvelteDate('2024-12-05'),
        max_time_slots: 3,
        show_search_for_time_slots: false,
        introduction_text: [],
        privacy_policy_link: null,
        legal_notice_link: null,
      };

      vi.mocked(loadConfig).mockResolvedValue(mockConfig);

      global.window = {
        location: { search: '' },
      } as unknown as Window & typeof globalThis;

      await initializeBooking({
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
        derivedStores: mockDerivedStores,
      });

      expect(mockUIStore.setView).toHaveBeenCalledWith('steps');
    });

    it('should load booking when ID in URL', async () => {
      const { loadConfig, loadBooking, loadTimeSlots } = await import('./bookingApi');
      const mockConfig: Config = {
        id: '1',
        documentId: 'config-1',
        route_planning_deadline: new SvelteDate('2024-12-01'),
        final_deadline: new SvelteDate('2024-12-05'),
        max_time_slots: 3,
        show_search_for_time_slots: false,
        introduction_text: [],
        privacy_policy_link: null,
        legal_notice_link: null,
      };

      const mockTimeSlot: TimeSlot = {
        id: '1',
        documentId: 'slot-1',
        start: '2024-12-05T19:00:00+01:00',
        end: '2024-12-05T19:30:00+01:00',
        max_bookings: 4,
      };

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
        time_slots: [mockTimeSlot],
        children: [{ name: 'Anna', identification_trait: 'Blond', speech: 'Gedicht' }],
        additional_notes: '',
      };

      vi.mocked(loadConfig).mockResolvedValue(mockConfig);
      vi.mocked(loadBooking).mockResolvedValue(mockBooking);
      vi.mocked(loadTimeSlots).mockResolvedValue([mockTimeSlot]);

      global.window = {
        location: { search: '?id=booking-1' },
      } as unknown as Window & typeof globalThis;

      await initializeBooking({
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
        derivedStores: mockDerivedStores,
      });

      expect(mockUIStore.setBookingId).toHaveBeenCalledWith('booking-1');
      expect(mockUIStore.setView).toHaveBeenCalledWith('steps');
    });

    it('should not load when already loading', async () => {
      mockUIStore.isLoading = true;

      await initializeBooking({
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
        derivedStores: mockDerivedStores,
      });

      expect(mockBookingStore.reset).not.toHaveBeenCalled();
    });

    it('should skip config loading when already loaded', async () => {
      const { loadConfig } = await import('./bookingApi');
      mockOptionsStore.id = '1';

      global.window = {
        location: { search: '' },
      } as unknown as Window & typeof globalThis;

      await initializeBooking({
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
        derivedStores: mockDerivedStores,
      });

      expect(loadConfig).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const { loadConfig } = await import('./bookingApi');
      const error: ApiError = { message: 'Network error' };
      vi.mocked(loadConfig).mockRejectedValue(error);

      global.window = {
        location: { search: '' },
      } as unknown as Window & typeof globalThis;

      await initializeBooking({
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
        derivedStores: mockDerivedStores,
      });

      expect(mockUIStore.setLoading).toHaveBeenCalledWith(false);
      expect(mockUIStore.setError).toHaveBeenCalledWith(error, true);
    });

    it('should handle SSR environment (no window)', async () => {
      const { loadConfig } = await import('./bookingApi');
      const mockConfig: Config = {
        id: '1',
        documentId: 'config-1',
        route_planning_deadline: new SvelteDate('2024-12-01'),
        final_deadline: new SvelteDate('2024-12-05'),
        max_time_slots: 3,
        show_search_for_time_slots: false,
        introduction_text: [],
        privacy_policy_link: null,
        legal_notice_link: null,
      };

      vi.mocked(loadConfig).mockResolvedValue(mockConfig);

      // No window in SSR
      global.window = undefined as unknown as Window & typeof globalThis;

      await initializeBooking({
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
        derivedStores: mockDerivedStores,
      });

      expect(mockUIStore.setLoading).toHaveBeenCalledWith(true);
      expect(mockUIStore.setLoading).toHaveBeenCalledWith(false);
      expect(mockOptionsStore.update).toHaveBeenCalled();
    });
  });

  describe('loadBookingData', () => {
    it('should load booking and update stores', async () => {
      const { loadBooking, loadTimeSlots } = await import('./bookingApi');
      const mockTimeSlot: TimeSlot = {
        id: '1',
        documentId: 'slot-1',
        start: '2024-12-05T19:00:00+01:00',
        end: '2024-12-05T19:30:00+01:00',
        max_bookings: 4,
      };
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
        time_slots: [mockTimeSlot],
        children: [{ name: 'Anna', identification_trait: 'Blond', speech: 'Gedicht' }],
        additional_notes: '',
      };

      vi.mocked(loadBooking).mockResolvedValue(mockBooking);
      vi.mocked(loadTimeSlots).mockResolvedValue([mockTimeSlot]);

      await loadBookingData({
        bookingId: 'booking-1',
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
        derivedStores: mockDerivedStores,
      });

      expect(loadBooking).toHaveBeenCalledWith('booking-1');
      expect(loadTimeSlots).toHaveBeenCalledWith('booking-1');
      expect(mockBookingStore.updateFromDatabase).toHaveBeenCalled();
      expect(mockBookingStore.setAvailableTimeSlots).toHaveBeenCalled();
      expect(mockBookingStore.setSelectedTimeSlotIds).toHaveBeenCalledWith(['slot-1']);
      expect(mockUIStore.setCanJumpToAnyStep).toHaveBeenCalledWith(true);
      expect(mockUIStore.setStep).toHaveBeenCalled();
      expect(mockUIStore.updateStep).toHaveBeenCalled();
    });

    it('should extract time slot IDs from multiple time slots', async () => {
      const { loadBooking, loadTimeSlots } = await import('./bookingApi');
      const mockTimeSlots: TimeSlot[] = [
        {
          id: '1',
          documentId: 'slot-1',
          start: '2024-12-05T19:00:00+01:00',
          end: '2024-12-05T19:30:00+01:00',
          max_bookings: 4,
        },
        {
          id: '2',
          documentId: 'slot-2',
          start: '2024-12-05T20:00:00+01:00',
          end: '2024-12-05T20:30:00+01:00',
          max_bookings: 4,
        },
      ];
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
        time_slots: mockTimeSlots,
        children: [{ name: 'Anna', identification_trait: 'Blond', speech: 'Gedicht' }],
        additional_notes: '',
      };

      vi.mocked(loadBooking).mockResolvedValue(mockBooking);
      vi.mocked(loadTimeSlots).mockResolvedValue(mockTimeSlots);

      await loadBookingData({
        bookingId: 'booking-1',
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
        derivedStores: mockDerivedStores,
      });

      expect(mockBookingStore.setSelectedTimeSlotIds).toHaveBeenCalledWith(['slot-1', 'slot-2']);
    });

    it('should handle booking with undefined time slots', async () => {
      const { loadBooking, loadTimeSlots } = await import('./bookingApi');
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
        time_slots: undefined as unknown as Booking['time_slots'],
        children: [],
        additional_notes: '',
      };

      vi.mocked(loadBooking).mockResolvedValue(mockBooking);
      vi.mocked(loadTimeSlots).mockResolvedValue([]);

      await loadBookingData({
        bookingId: 'booking-1',
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
        derivedStores: mockDerivedStores,
      });

      expect(mockBookingStore.setSelectedTimeSlotIds).toHaveBeenCalledWith([]);
    });

    it('should not load when already loading', async () => {
      mockUIStore.isLoading = true;

      await loadBookingData({
        bookingId: 'booking-1',
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
        derivedStores: mockDerivedStores,
      });

      expect(mockBookingStore.reset).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const { loadBooking } = await import('./bookingApi');
      const error: ApiError = { message: 'Not found' };
      vi.mocked(loadBooking).mockRejectedValue(error);

      await loadBookingData({
        bookingId: 'booking-1',
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
        derivedStores: mockDerivedStores,
      });

      expect(mockUIStore.setError).toHaveBeenCalledWith(error);
      expect(mockUIStore.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('fetchAndUpdateTimeSlots', () => {
    it('should fetch and update time slots', async () => {
      const { loadTimeSlots } = await import('./bookingApi');
      const mockTimeSlots: TimeSlot[] = [
        {
          id: '1',
          documentId: 'slot-1',
          start: '2024-12-05T19:00:00+01:00',
          end: '2024-12-05T19:30:00+01:00',
          max_bookings: 4,
        },
      ];

      vi.mocked(loadTimeSlots).mockResolvedValue(mockTimeSlots);

      await fetchAndUpdateTimeSlots('booking-1', mockBookingStore, mockUIStore);

      expect(loadTimeSlots).toHaveBeenCalledWith('booking-1');
      expect(mockBookingStore.setAvailableTimeSlots).toHaveBeenCalledWith(mockTimeSlots);
    });

    it('should fetch all slots when no booking ID', async () => {
      const { loadTimeSlots } = await import('./bookingApi');
      vi.mocked(loadTimeSlots).mockResolvedValue([]);

      await fetchAndUpdateTimeSlots(null, mockBookingStore, mockUIStore);

      expect(loadTimeSlots).toHaveBeenCalledWith(undefined);
    });

    it('should handle errors', async () => {
      const { loadTimeSlots } = await import('./bookingApi');
      const error: ApiError = { message: 'Error' };
      vi.mocked(loadTimeSlots).mockRejectedValue(error);

      await fetchAndUpdateTimeSlots('booking-1', mockBookingStore, mockUIStore);

      expect(mockUIStore.setError).toHaveBeenCalledWith(error);
    });
  });

  describe('handleStepChange', () => {
    const mockFetchTimeSlots = vi.fn();

    beforeEach(() => {
      mockFetchTimeSlots.mockClear();
    });

    it('should change step when canJumpToAnyStep is true and no changes', async () => {
      await handleStepChange(
        2,
        true,
        false,
        mockBookingStore,
        mockValidationStore,
        mockUIStore,
        mockFetchTimeSlots,
      );

      expect(mockValidationStore.clearAll).toHaveBeenCalled();
      expect(mockUIStore.setStep).toHaveBeenCalledWith(2);
      expect(mockFetchTimeSlots).toHaveBeenCalled();
    });

    it('should not change step when canJumpToAnyStep is false', async () => {
      await handleStepChange(
        2,
        false,
        false,
        mockBookingStore,
        mockValidationStore,
        mockUIStore,
        mockFetchTimeSlots,
      );

      expect(mockUIStore.setStep).not.toHaveBeenCalled();
    });

    it('should revert changes and change step when user confirms', async () => {
      // Mock window and global confirm function
      const confirmFn = vi.fn(() => true);
      global.window = {
        confirm: confirmFn,
      } as unknown as Window & typeof globalThis;
      global.confirm = confirmFn;

      await handleStepChange(
        2,
        true,
        true,
        mockBookingStore,
        mockValidationStore,
        mockUIStore,
        mockFetchTimeSlots,
      );

      expect(mockBookingStore.revertToDatabase).toHaveBeenCalled();
      expect(mockUIStore.setStep).toHaveBeenCalledWith(2);
    });

    it('should not change step when user cancels confirmation', async () => {
      // Mock window and global confirm function
      const confirmFn = vi.fn(() => false);
      global.window = {
        confirm: confirmFn,
      } as unknown as Window & typeof globalThis;
      global.confirm = confirmFn;

      await handleStepChange(
        2,
        true,
        true,
        mockBookingStore,
        mockValidationStore,
        mockUIStore,
        mockFetchTimeSlots,
      );

      expect(mockUIStore.setStep).not.toHaveBeenCalled();
    });

    it('should fetch time slots when navigating to step 2', async () => {
      await handleStepChange(
        2,
        true,
        false,
        mockBookingStore,
        mockValidationStore,
        mockUIStore,
        mockFetchTimeSlots,
      );

      expect(mockFetchTimeSlots).toHaveBeenCalled();
    });

    it('should not fetch time slots when navigating to other steps', async () => {
      await handleStepChange(
        1,
        true,
        false,
        mockBookingStore,
        mockValidationStore,
        mockUIStore,
        mockFetchTimeSlots,
      );

      // Should be called once from revert, not from step change
      expect(mockFetchTimeSlots).not.toHaveBeenCalled();
    });

    it('should revert changes without confirm dialog in SSR environment', async () => {
      // Remove window to simulate SSR
      global.window = undefined as unknown as Window & typeof globalThis;

      await handleStepChange(
        2,
        true,
        true,
        mockBookingStore,
        mockValidationStore,
        mockUIStore,
        mockFetchTimeSlots,
      );

      expect(mockBookingStore.revertToDatabase).toHaveBeenCalled();
      expect(mockFetchTimeSlots).toHaveBeenCalled();
      expect(mockUIStore.setStep).toHaveBeenCalledWith(2);
    });
  });
});
