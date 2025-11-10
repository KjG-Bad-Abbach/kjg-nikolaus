import { describe, expect, it, beforeEach } from 'vitest';
import { bookingStore } from './bookingStore.svelte';
import type { Booking, TimeSlot } from '$lib/types/booking';

describe('bookingStore', () => {
  beforeEach(() => {
    bookingStore.reset();
  });

  it('should have default empty booking', () => {
    expect(bookingStore.booking).toEqual({
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
    });
  });

  it('should have empty database state initially', () => {
    expect(bookingStore.bookingLoadedFromDatabase).toEqual({
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
    });
  });

  it('should have empty time slot data initially', () => {
    expect(bookingStore.selectedTimeSlotIds).toEqual([]);
    expect(bookingStore.availableTimeSlots).toEqual([]);
    expect(bookingStore.groupedTimeSlotIds).toEqual({});
    expect(bookingStore.timeSlotSearchQuery).toBe('');
  });

  it('should update booking from database', () => {
    const databaseData: Partial<Booking> = {
      contact_person: {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123 456789',
      },
      location: {
        street: 'Hauptstraße',
        house_number: '123',
        zip_code: '12345',
        place: 'Berlin',
      },
      present_location: 'Wohnzimmer',
    };

    bookingStore.updateFromDatabase(databaseData);

    expect(bookingStore.booking.contact_person.first_name).toBe('Max');
    expect(bookingStore.booking.location.street).toBe('Hauptstraße');
    expect(bookingStore.booking.present_location).toBe('Wohnzimmer');

    // Database state should also be stored
    expect(bookingStore.bookingLoadedFromDatabase.contact_person.first_name).toBe('Max');
  });

  it('should update specific field', () => {
    bookingStore.updateField('present_location', 'Küche');
    expect(bookingStore.booking.present_location).toBe('Küche');

    bookingStore.updateField('additional_notes', 'Test notes');
    expect(bookingStore.booking.additional_notes).toBe('Test notes');
  });

  it('should detect no changes when booking matches database', () => {
    expect(bookingStore.hasChanges()).toBe(false);
  });

  it('should detect changes in contact person', () => {
    bookingStore.updateFromDatabase({
      contact_person: {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123 456789',
      },
    });

    expect(bookingStore.hasChanges()).toBe(false);

    bookingStore.booking.contact_person.first_name = 'Anna';
    expect(bookingStore.hasChanges()).toBe(true);

    bookingStore.booking.contact_person.first_name = 'Max';
    expect(bookingStore.hasChanges()).toBe(false);
  });

  it('should detect changes in location', () => {
    bookingStore.updateFromDatabase({
      location: {
        street: 'Hauptstraße',
        house_number: '123',
        zip_code: '12345',
        place: 'Berlin',
      },
    });

    bookingStore.booking.location.street = 'Nebenstraße';
    expect(bookingStore.hasChanges()).toBe(true);
  });

  it('should detect changes in present_location', () => {
    bookingStore.updateFromDatabase({
      present_location: 'Wohnzimmer',
    });

    bookingStore.booking.present_location = 'Küche';
    expect(bookingStore.hasChanges()).toBe(true);
  });

  it('should detect changes in children array', () => {
    bookingStore.updateFromDatabase({
      children: [
        {
          name: 'Emma',
          identification_trait: 'blonde Haare',
          speech: 'Test speech',
        },
      ],
    });

    expect(bookingStore.hasChanges()).toBe(false);

    bookingStore.booking.children.push({
      name: 'Lukas',
      identification_trait: 'braune Haare',
      speech: 'Another speech',
    });

    expect(bookingStore.hasChanges()).toBe(true);
  });

  it('should ignore whitespace differences in strings', () => {
    bookingStore.updateFromDatabase({
      contact_person: {
        first_name: '  Max  ',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123 456789',
      },
    });

    bookingStore.booking.contact_person.first_name = 'Max';
    expect(bookingStore.hasChanges()).toBe(false);
  });

  it('should treat empty string and undefined as same', () => {
    bookingStore.updateFromDatabase({
      present_location: undefined,
    });

    bookingStore.booking.present_location = '';
    expect(bookingStore.hasChanges()).toBe(false);
  });

  it('should revert to database state', () => {
    bookingStore.updateFromDatabase({
      contact_person: {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123 456789',
      },
    });

    bookingStore.booking.contact_person.first_name = 'Anna';
    expect(bookingStore.hasChanges()).toBe(true);

    bookingStore.revertToDatabase();
    expect(bookingStore.booking.contact_person.first_name).toBe('Max');
    expect(bookingStore.hasChanges()).toBe(false);
  });

  it('should set available time slots', () => {
    const timeSlots: TimeSlot[] = [
      {
        id: '1',
        documentId: 'slot-1',
        start: '2024-12-05T19:00:00+01:00',
        end: '2024-12-05T19:30:00+01:00',
      },
      {
        id: '2',
        documentId: 'slot-2',
        start: '2024-12-05T19:30:00+01:00',
        end: '2024-12-05T20:00:00+01:00',
      },
    ];

    bookingStore.setAvailableTimeSlots(timeSlots);
    expect(bookingStore.availableTimeSlots).toEqual(timeSlots);
  });

  it('should set selected time slot IDs', () => {
    bookingStore.setSelectedTimeSlotIds(['slot-1', 'slot-2']);
    expect(bookingStore.selectedTimeSlotIds).toEqual(['slot-1', 'slot-2']);
  });

  it('should add time slot ID', () => {
    bookingStore.addTimeSlotId('slot-1');
    expect(bookingStore.selectedTimeSlotIds).toEqual(['slot-1']);

    bookingStore.addTimeSlotId('slot-2');
    expect(bookingStore.selectedTimeSlotIds).toEqual(['slot-1', 'slot-2']);
  });

  it('should not add duplicate time slot ID', () => {
    bookingStore.addTimeSlotId('slot-1');
    bookingStore.addTimeSlotId('slot-1');
    expect(bookingStore.selectedTimeSlotIds).toEqual(['slot-1']);
  });

  it('should remove time slot ID', () => {
    bookingStore.setSelectedTimeSlotIds(['slot-1', 'slot-2', 'slot-3']);
    bookingStore.removeTimeSlotId('slot-2');
    expect(bookingStore.selectedTimeSlotIds).toEqual(['slot-1', 'slot-3']);
  });

  it('should set grouped time slot IDs', () => {
    const grouped = {
      '2024-12-05': ['slot-1', 'slot-2'],
      '2024-12-06': ['slot-3', 'slot-4'],
    };

    bookingStore.setGroupedTimeSlotIds(grouped);
    expect(bookingStore.groupedTimeSlotIds).toEqual(grouped);
  });

  it('should set time slot search query', () => {
    bookingStore.setTimeSlotSearchQuery('19:00');
    expect(bookingStore.timeSlotSearchQuery).toBe('19:00');
  });

  it('should handle undefined time slots from database', () => {
    bookingStore.updateFromDatabase({
      time_slots: undefined,
    });

    expect(bookingStore.hasChanges()).toBe(false);

    bookingStore.setSelectedTimeSlotIds(['slot-1']);
    expect(bookingStore.hasChanges()).toBe(true);
  });

  it('should detect changes in time slot IDs', () => {
    const timeSlots: TimeSlot[] = [
      {
        id: '1',
        documentId: 'slot-1',
        start: '2024-12-05T19:00:00+01:00',
        end: '2024-12-05T19:30:00+01:00',
      },
    ];

    bookingStore.updateFromDatabase({
      time_slots: timeSlots,
    });

    bookingStore.setSelectedTimeSlotIds(['slot-1']);
    expect(bookingStore.hasChanges()).toBe(false);

    bookingStore.setSelectedTimeSlotIds(['slot-1', 'slot-2']);
    expect(bookingStore.hasChanges()).toBe(true);
  });

  it('should ignore order when comparing time slot IDs', () => {
    const timeSlots: TimeSlot[] = [
      {
        id: '1',
        documentId: 'slot-1',
        start: '2024-12-05T19:00:00+01:00',
        end: '2024-12-05T19:30:00+01:00',
      },
      {
        id: '2',
        documentId: 'slot-2',
        start: '2024-12-05T19:30:00+01:00',
        end: '2024-12-05T20:00:00+01:00',
      },
    ];

    bookingStore.updateFromDatabase({
      time_slots: timeSlots,
    });

    // Different order, same IDs
    bookingStore.setSelectedTimeSlotIds(['slot-2', 'slot-1']);
    expect(bookingStore.hasChanges()).toBe(false);
  });

  it('should reset all state', () => {
    bookingStore.updateFromDatabase({
      contact_person: {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123 456789',
      },
    });
    bookingStore.setSelectedTimeSlotIds(['slot-1']);
    bookingStore.setTimeSlotSearchQuery('19:00');

    bookingStore.reset();

    expect(bookingStore.booking.contact_person.first_name).toBe('');
    expect(bookingStore.bookingLoadedFromDatabase.contact_person.first_name).toBe('');
    expect(bookingStore.selectedTimeSlotIds).toEqual([]);
    expect(bookingStore.timeSlotSearchQuery).toBe('');
  });

  it('should detect changes with null vs undefined values', () => {
    bookingStore.updateFromDatabase({
      additional_notes: '',
    });

    // null should not be considered a change from empty string
    bookingStore.booking.additional_notes = '';
    expect(bookingStore.hasChanges()).toBe(false);
  });

  it('should detect changes when undefined', () => {
    bookingStore.booking = { ...bookingStore.booking };
    bookingStore.bookingLoadedFromDatabase = undefined as unknown as Booking;

    expect(bookingStore.hasChanges()).toBe(true);
  });

  it('should detect changes with numeric values', () => {
    // Adding a new property to simulate change
    bookingStore.updateField('test' as keyof Booking, 123);

    expect(bookingStore.hasChanges()).toBe(true);
  });

  it('should handle boolean values in change detection', () => {
    // Adding a new property to simulate change
    bookingStore.updateField('test' as keyof Booking, true);

    expect(bookingStore.hasChanges()).toBe(true);
  });
});
