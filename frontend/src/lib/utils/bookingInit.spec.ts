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
import type { Config, Booking, TimeSlot, ApiError } from '$lib/types/booking';
import { SvelteDate } from 'svelte/reactivity';
import { sendRequest } from '$lib/api/client';
import { bookingStore } from '$lib/stores/bookingStore.svelte';

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
  let originalWindow: typeof window;

  beforeEach(() => {
    vi.resetAllMocks();

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
      bookingLoadedFromDatabase: { time_slots: [] },
      updateFromDatabase: vi.fn(),
      setAvailableTimeSlots: vi.fn(),
      hasChanges: vi.fn(() => false),
      revertToDatabase: vi.fn(),
    } as unknown as BookingStore;

    // Mock Validation Store
    mockValidationStore = {
      clearAll: vi.fn(),
    } as unknown as ValidationStore;
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  describe('initializeBooking', () => {
    it.each([
      {
        state: 'ConfigConfiguration_Expect_CorrectPrecedence',
        browser: {},
        build: {},
        expected: { token: 'config-token', url: 'https://config.example' },
      },
      {
        state: 'BuildConfiguration_Expect_CorrectPrecedence',
        browser: {},
        build: { token: 'build-token', url: 'https://build.example' },
        expected: { token: 'build-token', url: 'https://build.example' },
      },
      {
        state: 'EmptyBuildConfiguration_Expect_ResponseFallback',
        browser: {},
        build: { token: '', url: '' },
        expected: { token: 'config-token', url: 'https://config.example' },
      },
      {
        state: 'BrowserConfiguration_Expect_CorrectPrecedence',
        browser: { token: 'browser-token', url: 'https://browser.example' },
        build: { token: 'build-token', url: 'https://build.example' },
        expected: { token: 'browser-token', url: 'https://browser.example' },
      },
      {
        state: 'EmptyBrowserConfiguration_Expect_BuildFallback',
        browser: { token: '', url: '' },
        build: { token: 'build-token', url: 'https://build.example' },
        expected: { token: 'build-token', url: 'https://build.example' },
      },
      {
        state: 'EmptyBrowserAndBuildConfiguration_Expect_ResponseFallback',
        browser: { token: '', url: '' },
        build: { token: '', url: '' },
        expected: { token: 'config-token', url: 'https://config.example' },
      },
      {
        state: 'MixedConfiguration_Expect_IndependentFieldPrecedence',
        browser: { token: 'browser-token' },
        build: { url: 'https://build.example' },
        expected: { token: 'browser-token', url: 'https://build.example' },
      },
      {
        state: 'MixedEmptyToken_Expect_BuildTokenAndBrowserBaseUrl',
        browser: { token: '', url: 'https://browser.example' },
        build: { token: 'build-token', url: '' },
        expected: { token: 'build-token', url: 'https://browser.example' },
      },
      {
        state: 'MixedEmptyBaseUrl_Expect_BrowserTokenAndResponseBaseUrl',
        browser: { token: 'browser-token', url: '' },
        build: { token: '', url: '' },
        expected: { token: 'browser-token', url: 'https://config.example' },
      },
    ])('InitializeBooking_$state', async ({ browser, build, expected }) => {
      // Arrange
      const { loadConfig } = await import('./bookingApi');
      vi.stubEnv('VITE_API_TOKEN', build.token);
      vi.stubEnv('VITE_API_BASE_URL', build.url);
      const fetchRequest = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: {} }),
      });
      vi.stubGlobal('fetch', fetchRequest);
      const browserConfig = {
        location: { search: '' },
        API_TOKEN: browser.token,
        API_BASE_URL: browser.url,
      };
      global.window = browserConfig as unknown as Window & typeof globalThis;
      vi.mocked(loadConfig).mockResolvedValue({
        id: '1',
        documentId: 'config-1',
        route_planning_deadline: new SvelteDate('2024-12-01'),
        final_deadline: new SvelteDate('2024-12-05'),
        max_time_slots: 3,
        show_search_for_time_slots: false,
        introduction_text: [],
        privacy_policy_link: null,
        legal_notice_link: null,
        api_token: 'config-token',
        api_base_url: 'https://config.example',
      });

      // Act
      await initializeBooking({
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
      });
      await sendRequest({ url: '/api/bookings/bootstrap-check' });

      // Assert
      expect(browserConfig.API_TOKEN).toBe(expected.token);
      expect(browserConfig.API_BASE_URL).toBe(expected.url);
      expect(fetchRequest).toHaveBeenCalledExactlyOnceWith(
        `${expected.url}/api/bookings/bootstrap-check`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(expected.token ? { Authorization: `Bearer ${expected.token}` } : {}),
          },
        },
      );
    });

    it('InitializeBooking_UnsavedChangesCallback_Expect_CurrentStoreChangeState', async () => {
      // Arrange
      const { registerCheckUnsavedChanges } = await import('./unsavedChanges');
      mockOptionsStore.id = '1';
      global.window = { location: { search: '' } } as unknown as Window & typeof globalThis;
      await initializeBooking({
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
      });
      const checkChanges = vi.mocked(registerCheckUnsavedChanges).mock.calls[0][0];

      // Act
      const saved = checkChanges();
      vi.mocked(mockBookingStore.hasChanges).mockReturnValue(true);
      const edited = checkChanges();
      vi.mocked(mockBookingStore.hasChanges).mockReturnValue(false);
      const discarded = checkChanges();

      // Assert
      expect([saved, edited, discarded]).toEqual([false, true, false]);
    });

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
      });

      expect(mockUIStore.setLoading).toHaveBeenCalledWith(true);
      expect(mockUIStore.setLoading).toHaveBeenCalledWith(false);
      expect(mockOptionsStore.update).toHaveBeenCalled();
    });
  });

  describe('loadBookingData', () => {
    it('loadBookingData_SavedLaterPageSlot_Expect_CleanSelectionAfterLoadDiscardAndSave', async () => {
      // Arrange
      const api = await vi.importActual<typeof import('./bookingApi')>('./bookingApi');
      const { loadBooking, loadTimeSlots } = await import('./bookingApi');
      vi.mocked(loadBooking).mockImplementationOnce(api.loadBooking);
      vi.mocked(loadTimeSlots)
        .mockImplementationOnce(api.loadTimeSlots)
        .mockImplementationOnce(api.loadTimeSlots);
      bookingStore.reset();
      const rawSlots = Array.from({ length: 26 }, (_, index) => ({
        id: index + 1,
        documentId: `slot-${index + 1}`,
        start: new Date(Date.UTC(2026, 11, 5, 16, (26 - index) * 15)).toISOString(),
        end: new Date(Date.UTC(2026, 11, 5, 16, (27 - index) * 15)).toISOString(),
        max_bookings: 4,
        max_reservations: 12,
        available_reservations: 0,
      }));
      const savedBooking = {
        ...bookingStore.booking,
        documentId: 'booking-1',
        time_slots: [rawSlots[25]],
      };
      const pages = [rawSlots.slice(0, 25), rawSlots.slice(25)].map((data, index) => ({
        data,
        meta: { pagination: { page: index + 1, pageSize: 25, pageCount: 2, total: 26 } },
      }));
      const fetchRequest = vi.fn();
      for (const response of [{ data: savedBooking }, ...pages, ...pages, { data: savedBooking }]) {
        fetchRequest.mockResolvedValueOnce(Response.json(response));
      }
      vi.stubGlobal('fetch', fetchRequest);
      vi.stubEnv('VITE_API_BASE_URL', '');
      vi.stubEnv('VITE_API_TOKEN', '');

      // Act
      await loadBookingData({
        bookingId: 'booking-1',
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore,
        validationStore: mockValidationStore,
      });

      // Assert
      expect(mockUIStore.setError).toHaveBeenLastCalledWith(null);
      expect(bookingStore.selectedTimeSlotIds).toEqual(['slot-26']);
      expect(bookingStore.hasChanges()).toBe(false);
      expect(bookingStore.availableTimeSlots.map((slot) => slot.documentId)).toEqual(
        rawSlots.map((slot) => slot.documentId).reverse(),
      );
      expect(bookingStore.availableTimeSlots[0].available_reservations).toBe(1);

      // Act
      bookingStore.setSelectedTimeSlotIds(['slot-1']);
      const hasUnsavedSelection = bookingStore.hasChanges();
      bookingStore.revertToDatabase();
      await fetchAndUpdateTimeSlots('booking-1', bookingStore, mockUIStore);
      await api.updateBookingTimeSlots('booking-1', bookingStore.selectedTimeSlotIds);

      // Assert
      expect(hasUnsavedSelection).toBe(true);
      expect(bookingStore.selectedTimeSlotIds).toEqual(['slot-26']);
      expect(bookingStore.hasChanges()).toBe(false);
      expect(bookingStore.availableTimeSlots[0].available_reservations).toBe(1);
      expect(fetchRequest).toHaveBeenCalledTimes(6);
      expect(fetchRequest).toHaveBeenLastCalledWith('/api/bookings/booking-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { time_slots: ['slot-26'] } }),
      });
    });

    it('should load booking and update stores', async () => {
      // Arrange
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

      // Act
      await loadBookingData({
        bookingId: 'booking-1',
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
      });

      // Assert
      expect(loadBooking).toHaveBeenCalledWith('booking-1');
      expect(loadTimeSlots).toHaveBeenCalledWith(['slot-1']);
      expect(mockBookingStore.setAvailableTimeSlots).toHaveBeenCalled();
      expect(mockBookingStore.updateFromDatabase).toHaveBeenCalledWith(mockBooking);
      expect(mockUIStore.setCanJumpToAnyStep).toHaveBeenCalledWith(true);
      expect(mockUIStore.setStep).toHaveBeenCalledWith(2);
      expect(mockUIStore.updateStep).toHaveBeenNthCalledWith(5, 4, {
        allFilled: false,
        anyFilled: false,
      });
      expect(mockValidationStore.clearAll).toHaveBeenCalled();
    });

    it('should extract time slot IDs from multiple time slots', async () => {
      // Arrange
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

      // Act
      await loadBookingData({
        bookingId: 'booking-1',
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
      });

      // Assert
      expect(mockBookingStore.updateFromDatabase).toHaveBeenCalledWith(mockBooking);
      expect(loadTimeSlots).toHaveBeenCalledWith(['slot-1', 'slot-2']);
    });

    it('should handle booking with undefined time slots', async () => {
      // Arrange
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

      // Act
      await loadBookingData({
        bookingId: 'booking-1',
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
      });

      // Assert
      expect(mockBookingStore.updateFromDatabase).toHaveBeenCalledWith(mockBooking);
      expect(loadTimeSlots).toHaveBeenCalledWith([]);
    });

    it('should not load when already loading', async () => {
      mockUIStore.isLoading = true;

      await loadBookingData({
        bookingId: 'booking-1',
        uiStore: mockUIStore,
        optionsStore: mockOptionsStore,
        bookingStore: mockBookingStore,
        validationStore: mockValidationStore,
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
      });

      expect(mockUIStore.setError).toHaveBeenCalledWith(error);
      expect(mockUIStore.setLoading).toHaveBeenCalledWith(false);
    });

    it.each(['booking', 'slots'])(
      'LoadBookingData_%sFailure_Expect_InitialNavigationPreservedAndRetryAvailable',
      async (failedRequest) => {
        // Arrange
        const { loadBooking, loadTimeSlots } = await import('./bookingApi');
        const error: ApiError = { message: 'Temporary failure' };
        const booking = {
          contact_person: { first_name: '', last_name: '', email: '', phone_number: '' },
          location: { street: '', house_number: '', zip_code: '', place: '' },
          present_location: '',
          time_slots: [],
          children: [],
          additional_notes: '',
        };
        vi.mocked(loadBooking).mockResolvedValue(booking);
        vi.mocked(loadTimeSlots).mockResolvedValue([]);
        if (failedRequest === 'booking') vi.mocked(loadBooking).mockRejectedValueOnce(error);
        if (failedRequest === 'slots') vi.mocked(loadTimeSlots).mockRejectedValueOnce(error);
        const context = {
          bookingId: 'booking-1',
          uiStore: mockUIStore,
          optionsStore: mockOptionsStore,
          bookingStore: mockBookingStore,
          validationStore: mockValidationStore,
        };

        // Act
        await loadBookingData(context);

        // Assert
        expect(mockUIStore.setError).toHaveBeenCalledWith(error);
        expect(mockUIStore.setCanJumpToAnyStep).not.toHaveBeenCalled();
        expect(mockUIStore.setStep).not.toHaveBeenCalled();
        expect(mockUIStore.updateStep).not.toHaveBeenCalled();
        expect(mockValidationStore.clearAll).not.toHaveBeenCalled();
        expect(mockUIStore.setLoading).toHaveBeenLastCalledWith(false);

        // Act
        await loadBookingData(context);

        // Assert
        expect(mockUIStore.setError).toHaveBeenLastCalledWith(null);
        expect(mockUIStore.setCanJumpToAnyStep).toHaveBeenCalledWith(true);
        expect(mockUIStore.setStep).toHaveBeenCalledWith(0);
        expect(mockValidationStore.clearAll).toHaveBeenCalledOnce();
      },
    );
  });

  describe('fetchAndUpdateTimeSlots', () => {
    it('should fetch and update time slots', async () => {
      // Arrange
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
      mockBookingStore.bookingLoadedFromDatabase.time_slots = mockTimeSlots;
      mockBookingStore.selectedTimeSlotIds = ['unsaved-slot'];

      // Act
      await fetchAndUpdateTimeSlots('booking-1', mockBookingStore, mockUIStore);

      // Assert
      expect(loadTimeSlots).toHaveBeenCalledWith(['slot-1']);
      expect(mockBookingStore.setAvailableTimeSlots).toHaveBeenCalledWith(mockTimeSlots);
      expect(mockUIStore.setError).toHaveBeenCalledWith(null);
      expect(mockUIStore.setLoading).toHaveBeenNthCalledWith(1, true);
      expect(mockUIStore.setLoading).toHaveBeenLastCalledWith(false);
    });

    it('FetchAndUpdateTimeSlots_AlreadyLoading_Expect_NoConcurrentFetch', async () => {
      // Arrange
      const { loadTimeSlots } = await import('./bookingApi');
      mockUIStore.isLoading = true;

      // Act
      await fetchAndUpdateTimeSlots('booking-1', mockBookingStore, mockUIStore);

      // Assert
      expect(loadTimeSlots).not.toHaveBeenCalled();
      expect(mockUIStore.setLoading).not.toHaveBeenCalled();
    });

    it('should fetch all slots when no booking ID', async () => {
      // Arrange
      const { loadTimeSlots } = await import('./bookingApi');
      vi.mocked(loadTimeSlots).mockResolvedValue([]);

      // Act
      await fetchAndUpdateTimeSlots(null, mockBookingStore, mockUIStore);

      // Assert
      expect(loadTimeSlots).toHaveBeenCalledWith([]);
    });

    it('should handle errors', async () => {
      const { loadTimeSlots } = await import('./bookingApi');
      // Arrange
      const error: ApiError = { message: 'Error' };
      vi.mocked(loadTimeSlots).mockRejectedValue(error);

      // Act
      await fetchAndUpdateTimeSlots('booking-1', mockBookingStore, mockUIStore);

      // Assert
      expect(mockUIStore.setError).toHaveBeenCalledWith(error);
      expect(mockUIStore.setLoading).toHaveBeenLastCalledWith(false);
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
      // Arrange
      // Mock window and global confirm function
      const confirmFn = vi.fn(() => true);
      global.window = {
        confirm: confirmFn,
      } as unknown as Window & typeof globalThis;
      global.confirm = confirmFn;

      // Act
      await handleStepChange(
        2,
        true,
        true,
        mockBookingStore,
        mockValidationStore,
        mockUIStore,
        mockFetchTimeSlots,
      );

      // Assert
      expect(mockBookingStore.revertToDatabase).toHaveBeenCalled();
      expect(mockUIStore.setStep).toHaveBeenCalledWith(2);
      expect(mockFetchTimeSlots).toHaveBeenCalledTimes(1);
    });

    it('should not change step when user cancels confirmation', async () => {
      // Arrange
      // Mock window and global confirm function
      const confirmFn = vi.fn(() => false);
      global.window = {
        confirm: confirmFn,
      } as unknown as Window & typeof globalThis;
      global.confirm = confirmFn;

      // Act
      await handleStepChange(
        2,
        true,
        true,
        mockBookingStore,
        mockValidationStore,
        mockUIStore,
        mockFetchTimeSlots,
      );

      // Assert
      expect(mockUIStore.setStep).not.toHaveBeenCalled();
      expect(mockBookingStore.revertToDatabase).not.toHaveBeenCalled();
      expect(mockValidationStore.clearAll).not.toHaveBeenCalled();
      expect(mockFetchTimeSlots).not.toHaveBeenCalled();
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
