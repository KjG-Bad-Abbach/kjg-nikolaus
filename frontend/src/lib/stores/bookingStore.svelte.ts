import type { Booking, TimeSlot } from '$lib/types/booking';
import { clone, updateExistingObjectKeys } from '$lib/utils/object';
import { trim } from '$lib/utils/string';

/**
 * Booking data store
 * Manages booking form data, time slots, and change detection
 */

function createEmptyBooking(): Booking {
  return {
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
    children: [],
    time_slots: [],
    additional_notes: '',
  };
}

class BookingStore {
  // Current booking data
  booking = $state<Booking>(createEmptyBooking());

  // Booking data loaded from database (for change detection)
  bookingLoadedFromDatabase = $state<Booking>(createEmptyBooking());

  // Time slot management
  selectedTimeSlotIds = $state<string[]>([]);
  availableTimeSlots = $state<TimeSlot[]>([]);
  groupedTimeSlotIds = $state<Record<string, string[]>>({});
  timeSlotSearchQuery = $state('');

  /**
   * Reset to empty booking
   */
  reset() {
    this.booking = createEmptyBooking();
    this.bookingLoadedFromDatabase = createEmptyBooking();
    this.selectedTimeSlotIds = [];
    this.availableTimeSlots = [];
    this.groupedTimeSlotIds = {};
    this.timeSlotSearchQuery = '';
  }

  /**
   * Update booking data from API response
   */
  updateFromDatabase(data: Partial<Booking>) {
    this.booking = createEmptyBooking();
    updateExistingObjectKeys(this.booking as unknown as Record<string, unknown>, data);
    // Clone the complete booking state (not just the partial data) for change detection
    this.bookingLoadedFromDatabase = clone(this.booking) as Booking;
  }

  /**
   * Update specific fields in booking
   */
  updateField(field: keyof Booking, value: unknown) {
    (this.booking[field] as unknown) = value;
  }

  /**
   * Revert booking to database state
   */
  revertToDatabase() {
    this.booking = createEmptyBooking();
    updateExistingObjectKeys(
      this.booking as unknown as Record<string, unknown>,
      clone(this.bookingLoadedFromDatabase) as unknown as Record<string, unknown>,
    );
  }

  /**
   * Check if booking has unsaved changes
   */
  hasChanges(): boolean {
    const hasChanges = (current: unknown, database: unknown): boolean => {
      if (Array.isArray(current)) {
        if (current.length !== (database as unknown[] | undefined)?.length) {
          return true;
        }
        return current.some((x, index) => {
          const currentValue = x;
          const databaseValue = (database as unknown[] | undefined)?.[index];
          return hasChanges(currentValue, databaseValue);
        });
      } else if (typeof current === 'object' && current) {
        const currentKeys = Object.keys(current);
        return currentKeys.some((key) => {
          const currentValue =
            key === 'time_slots'
              ? this.selectedTimeSlotIds.slice().sort()
              : (current as Record<string, unknown>)[key];
          const databaseValue =
            key === 'time_slots'
              ? ((database as Record<string, unknown> | undefined)?.[key] as TimeSlot[] | undefined)
                  ?.map((x) => x.documentId)
                  .sort() || []
              : (database as Record<string, unknown> | undefined)?.[key];
          return hasChanges(currentValue, databaseValue);
        });
      } else if (typeof current === 'string') {
        return trim(current) !== trim(database as string | undefined);
      }
      /* v8 ignore next 1 - currently we do not have other values than strings, objects and arrays, but this would handle them */
      return current !== database;
    };

    return hasChanges(this.booking, this.bookingLoadedFromDatabase);
  }

  /**
   * Set available time slots
   */
  setAvailableTimeSlots(timeSlots: TimeSlot[]) {
    this.availableTimeSlots = timeSlots;
  }

  /**
   * Set selected time slot IDs
   */
  setSelectedTimeSlotIds(ids: string[]) {
    this.selectedTimeSlotIds = ids;
  }

  /**
   * Add a time slot ID to selection
   */
  addTimeSlotId(id: string) {
    if (!this.selectedTimeSlotIds.includes(id)) {
      this.selectedTimeSlotIds = [...this.selectedTimeSlotIds, id];
    }
  }

  /**
   * Remove a time slot ID from selection
   */
  removeTimeSlotId(id: string) {
    this.selectedTimeSlotIds = this.selectedTimeSlotIds.filter((x) => x !== id);
  }

  /**
   * Set grouped time slot IDs
   */
  setGroupedTimeSlotIds(grouped: Record<string, string[]>) {
    this.groupedTimeSlotIds = grouped;
  }

  /**
   * Set time slot search query
   */
  setTimeSlotSearchQuery(query: string) {
    this.timeSlotSearchQuery = query;
  }
}

export const bookingStore = new BookingStore();
export type { BookingStore };
