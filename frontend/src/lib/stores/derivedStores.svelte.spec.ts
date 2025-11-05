import { describe, expect, it, beforeEach } from 'vitest';
import { derivedStores } from './derivedStores.svelte';
import { optionsStore } from './optionsStore.svelte';
import { bookingStore } from './bookingStore.svelte';
import { SvelteDate } from 'svelte/reactivity';

describe('derivedStores', () => {
  beforeEach(() => {
    optionsStore.reset();
    bookingStore.reset();
  });

  describe('canEditRoutePlanning', () => {
    it('should return true when route planning deadline is in future', () => {
      const futureDate = new SvelteDate();
      futureDate.setDate(futureDate.getDate() + 7);
      optionsStore.update({ route_planning_deadline: futureDate });

      expect(derivedStores.canEditRoutePlanning).toBe(true);
    });

    it('should return false when route planning deadline is in past', () => {
      const pastDate = new SvelteDate('2004-11-27T23:59:59+01:00');
      optionsStore.update({ route_planning_deadline: pastDate });

      expect(derivedStores.canEditRoutePlanning).toBe(false);
    });
  });

  describe('canEditAnything', () => {
    it('should return true when final deadline is in future', () => {
      const futureDate = new SvelteDate();
      futureDate.setDate(futureDate.getDate() + 7);
      optionsStore.update({ final_deadline: futureDate });

      expect(derivedStores.canEditAnything).toBe(true);
    });

    it('should return false when final deadline is in past', () => {
      const pastDate = new SvelteDate('2004-12-01T23:59:59+01:00');
      optionsStore.update({ final_deadline: pastDate });

      expect(derivedStores.canEditAnything).toBe(false);
    });
  });

  describe('isRoutePlanningFilled', () => {
    it('should return false when address is empty', () => {
      bookingStore.booking.location = {
        street: '',
        house_number: '',
        zip_code: '',
        place: '',
      };
      bookingStore.booking.time_slots = [
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
        {
          id: '3',
          documentId: 'slot-3',
          start: '2024-12-05T20:00:00+01:00',
          end: '2024-12-05T20:30:00+01:00',
        },
      ];

      expect(derivedStores.isRoutePlanningFilled).toBe(false);
    });

    it('should return false when time slots are insufficient', () => {
      bookingStore.booking.location = {
        street: 'Hauptstraße',
        house_number: '123',
        zip_code: '12345',
        place: 'Berlin',
      };
      bookingStore.booking.time_slots = [
        {
          id: '1',
          documentId: 'slot-1',
          start: '2024-12-05T19:00:00+01:00',
          end: '2024-12-05T19:30:00+01:00',
        },
      ];

      expect(derivedStores.isRoutePlanningFilled).toBe(false);
    });

    it('should return true when address and time slots are filled', () => {
      bookingStore.booking.location = {
        street: 'Hauptstraße',
        house_number: '123',
        zip_code: '12345',
        place: 'Berlin',
      };
      bookingStore.booking.time_slots = [
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
        {
          id: '3',
          documentId: 'slot-3',
          start: '2024-12-05T20:00:00+01:00',
          end: '2024-12-05T20:30:00+01:00',
        },
      ];

      expect(derivedStores.isRoutePlanningFilled).toBe(true);
    });

    it('should respect max_time_slots option', () => {
      optionsStore.update({ max_time_slots: 2 });

      bookingStore.booking.location = {
        street: 'Hauptstraße',
        house_number: '123',
        zip_code: '12345',
        place: 'Berlin',
      };
      bookingStore.booking.time_slots = [
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

      expect(derivedStores.isRoutePlanningFilled).toBe(true);
    });
  });

  describe('isEverythingFilled', () => {
    it('should return false when contact person is incomplete', () => {
      bookingStore.booking.contact_person = {
        first_name: 'Max',
        last_name: '',
        email: 'max@example.com',
        phone_number: '+49 123 456789',
      };

      expect(derivedStores.isEverythingFilled).toBe(false);
    });

    it('should return false when location is incomplete', () => {
      bookingStore.booking.contact_person = {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123 456789',
      };
      bookingStore.booking.location = {
        street: 'Hauptstraße',
        house_number: '',
        zip_code: '12345',
        place: 'Berlin',
      };

      expect(derivedStores.isEverythingFilled).toBe(false);
    });

    it('should return false when present_location is empty', () => {
      bookingStore.booking.contact_person = {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123 456789',
      };
      bookingStore.booking.location = {
        street: 'Hauptstraße',
        house_number: '123',
        zip_code: '12345',
        place: 'Berlin',
      };
      bookingStore.booking.present_location = '';

      expect(derivedStores.isEverythingFilled).toBe(false);
    });

    it('should return false when time slots are insufficient', () => {
      bookingStore.booking.contact_person = {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123 456789',
      };
      bookingStore.booking.location = {
        street: 'Hauptstraße',
        house_number: '123',
        zip_code: '12345',
        place: 'Berlin',
      };
      bookingStore.booking.present_location = 'Wohnzimmer';
      bookingStore.booking.time_slots = [];

      expect(derivedStores.isEverythingFilled).toBe(false);
    });

    it('should return false when children are empty', () => {
      bookingStore.booking.contact_person = {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123 456789',
      };
      bookingStore.booking.location = {
        street: 'Hauptstraße',
        house_number: '123',
        zip_code: '12345',
        place: 'Berlin',
      };
      bookingStore.booking.present_location = 'Wohnzimmer';
      bookingStore.booking.time_slots = [
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
        {
          id: '3',
          documentId: 'slot-3',
          start: '2024-12-05T20:00:00+01:00',
          end: '2024-12-05T20:30:00+01:00',
        },
      ];
      bookingStore.booking.children = [];

      expect(derivedStores.isEverythingFilled).toBe(false);
    });

    it('should return false when children are incomplete', () => {
      bookingStore.booking.contact_person = {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123 456789',
      };
      bookingStore.booking.location = {
        street: 'Hauptstraße',
        house_number: '123',
        zip_code: '12345',
        place: 'Berlin',
      };
      bookingStore.booking.present_location = 'Wohnzimmer';
      bookingStore.booking.time_slots = [
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
        {
          id: '3',
          documentId: 'slot-3',
          start: '2024-12-05T20:00:00+01:00',
          end: '2024-12-05T20:30:00+01:00',
        },
      ];
      bookingStore.booking.children = [
        {
          name: 'Emma',
          identification_trait: '',
          speech: 'Test speech',
        },
      ];

      expect(derivedStores.isEverythingFilled).toBe(false);
    });

    it('should return true when everything is filled', () => {
      bookingStore.booking.contact_person = {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123 456789',
      };
      bookingStore.booking.location = {
        street: 'Hauptstraße',
        house_number: '123',
        zip_code: '12345',
        place: 'Berlin',
      };
      bookingStore.booking.present_location = 'Wohnzimmer';
      bookingStore.booking.time_slots = [
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
        {
          id: '3',
          documentId: 'slot-3',
          start: '2024-12-05T20:00:00+01:00',
          end: '2024-12-05T20:30:00+01:00',
        },
      ];
      bookingStore.booking.children = [
        {
          name: 'Emma',
          identification_trait: 'blonde Haare',
          speech: 'Test speech',
        },
      ];

      expect(derivedStores.isEverythingFilled).toBe(true);
    });
  });
});
