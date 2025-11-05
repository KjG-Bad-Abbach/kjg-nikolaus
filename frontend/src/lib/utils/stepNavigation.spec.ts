import { describe, expect, it } from 'vitest';
import {
  isContactComplete,
  isContactAnyFilled,
  isAddressComplete,
  isAddressAnyFilled,
  areTimeSlotsComplete,
  areTimeSlotsAnyFilled,
  areChildrenComplete,
  areChildrenAnyFilled,
  getFirstIncompleteStep,
  calculateStepCompletionStatus,
} from './stepNavigation';
import type { Booking, DerivedStores } from '$lib/types/booking';

describe('stepNavigation', () => {
  describe('isContactComplete', () => {
    it('should return true for complete contact', () => {
      const contact = {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123',
      };
      expect(isContactComplete(contact)).toBe(true);
    });

    it('should return false when first_name missing', () => {
      const contact = {
        first_name: '',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123',
      };
      expect(isContactComplete(contact)).toBe(false);
    });

    it('should return false when last_name missing', () => {
      const contact = {
        first_name: 'Max',
        last_name: '',
        email: 'max@example.com',
        phone_number: '+49 123',
      };
      expect(isContactComplete(contact)).toBe(false);
    });

    it('should return false when email missing', () => {
      const contact = {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: '',
        phone_number: '+49 123',
      };
      expect(isContactComplete(contact)).toBe(false);
    });

    it('should return false when phone_number missing', () => {
      const contact = {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '',
      };
      expect(isContactComplete(contact)).toBe(false);
    });

    it('should return false when contact is undefined', () => {
      expect(isContactComplete(undefined)).toBe(false);
    });
  });

  describe('isContactAnyFilled', () => {
    it('should return true when any field is filled', () => {
      const contact = {
        first_name: 'Max',
        last_name: '',
        email: '',
        phone_number: '',
      };
      expect(isContactAnyFilled(contact)).toBe(true);
    });

    it('should return false when all fields are empty', () => {
      const contact = {
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
      };
      expect(isContactAnyFilled(contact)).toBe(false);
    });

    it('should return false when contact is undefined', () => {
      expect(isContactAnyFilled(undefined)).toBe(false);
    });
  });

  describe('isAddressComplete', () => {
    const validLocation = {
      street: 'Hauptstraße',
      house_number: '123',
      zip_code: '12345',
      place: 'München',
    };

    it('should return true for complete address', () => {
      expect(isAddressComplete(validLocation, 'Wohnzimmer')).toBe(true);
    });

    it('should return false when street missing', () => {
      const location = { ...validLocation, street: '' };
      expect(isAddressComplete(location, 'Wohnzimmer')).toBe(false);
    });

    it('should return false when house_number missing', () => {
      const location = { ...validLocation, house_number: '' };
      expect(isAddressComplete(location, 'Wohnzimmer')).toBe(false);
    });

    it('should return false when zip_code missing', () => {
      const location = { ...validLocation, zip_code: '' };
      expect(isAddressComplete(location, 'Wohnzimmer')).toBe(false);
    });

    it('should return false when place missing', () => {
      const location = { ...validLocation, place: '' };
      expect(isAddressComplete(location, 'Wohnzimmer')).toBe(false);
    });

    it('should return false when presentLocation missing', () => {
      expect(isAddressComplete(validLocation, '')).toBe(false);
    });

    it('should return false when location is undefined', () => {
      expect(isAddressComplete(undefined, 'Wohnzimmer')).toBe(false);
    });
  });

  describe('isAddressAnyFilled', () => {
    it('should return true when any location field is filled', () => {
      const location = {
        street: 'Hauptstraße',
        house_number: '',
        zip_code: '',
        place: '',
      };
      expect(isAddressAnyFilled(location, '')).toBe(true);
    });

    it('should return true when presentLocation is filled', () => {
      const location = {
        street: '',
        house_number: '',
        zip_code: '',
        place: '',
      };
      expect(isAddressAnyFilled(location, 'Wohnzimmer')).toBe(true);
    });

    it('should return false when all fields are empty', () => {
      const location = {
        street: '',
        house_number: '',
        zip_code: '',
        place: '',
      };
      expect(isAddressAnyFilled(location, '')).toBe(false);
    });

    it('should return false when location is undefined and presentLocation is empty', () => {
      expect(isAddressAnyFilled(undefined, '')).toBe(false);
    });
  });

  describe('areTimeSlotsComplete', () => {
    it('should return true when enough slots selected', () => {
      const timeSlots = [{ documentId: 'id1' }, { documentId: 'id2' }, { documentId: 'id3' }];
      expect(areTimeSlotsComplete(timeSlots as Booking['time_slots'], 3)).toBe(true);
    });

    it('should return false when not enough slots selected', () => {
      const timeSlots = [{ documentId: 'id1' }, { documentId: 'id2' }];
      expect(areTimeSlotsComplete(timeSlots as Booking['time_slots'], 3)).toBe(false);
    });

    it('should return false when no slots selected', () => {
      expect(areTimeSlotsComplete([], 3)).toBe(false);
    });

    it('should return false when timeSlots is undefined', () => {
      expect(areTimeSlotsComplete(undefined, 3)).toBe(false);
    });

    it('should use default maxTimeSlots of 3', () => {
      const timeSlots = [{ documentId: 'id1' }, { documentId: 'id2' }];
      expect(areTimeSlotsComplete(timeSlots as Booking['time_slots'])).toBe(false);
    });
  });

  describe('areTimeSlotsAnyFilled', () => {
    it('should return true when at least one slot selected', () => {
      const timeSlots = [{ documentId: 'id1' }];
      expect(areTimeSlotsAnyFilled(timeSlots as Booking['time_slots'])).toBe(true);
    });

    it('should return false when no slots selected', () => {
      expect(areTimeSlotsAnyFilled([])).toBe(false);
    });

    it('should return false when timeSlots is undefined', () => {
      expect(areTimeSlotsAnyFilled(undefined)).toBe(false);
    });
  });

  describe('areChildrenComplete', () => {
    const validChild = {
      name: 'Anna',
      identification_trait: 'Blondes Haar',
      speech: 'Gedicht',
    };

    it('should return true for complete children', () => {
      expect(areChildrenComplete([validChild])).toBe(true);
    });

    it('should return false when no children provided', () => {
      expect(areChildrenComplete([])).toBe(false);
    });

    it('should return false when children is undefined', () => {
      expect(areChildrenComplete(undefined)).toBe(false);
    });

    it('should return false when child name missing', () => {
      const child = { ...validChild, name: '' };
      expect(areChildrenComplete([child])).toBe(false);
    });

    it('should return false when identification_trait missing', () => {
      const child = { ...validChild, identification_trait: '' };
      expect(areChildrenComplete([child])).toBe(false);
    });

    it('should return false when speech missing', () => {
      const child = { ...validChild, speech: '' };
      expect(areChildrenComplete([child])).toBe(false);
    });

    it('should return true only when all children are complete', () => {
      const completeChild = validChild;
      const incompleteChild = { ...validChild, name: '' };
      expect(areChildrenComplete([completeChild, incompleteChild])).toBe(false);
      expect(areChildrenComplete([completeChild, completeChild])).toBe(true);
    });
  });

  describe('areChildrenAnyFilled', () => {
    it('should return true when children array has elements', () => {
      const child = {
        name: 'Anna',
        identification_trait: '',
        speech: '',
      };
      expect(areChildrenAnyFilled([child], '')).toBe(true);
    });

    it('should return true when additional_notes is filled', () => {
      expect(areChildrenAnyFilled([], 'Some notes')).toBe(true);
    });

    it('should return false when both are empty', () => {
      expect(areChildrenAnyFilled([], '')).toBe(false);
    });

    it('should return false when children is undefined and notes is empty', () => {
      expect(areChildrenAnyFilled(undefined, '')).toBe(false);
    });
  });

  describe('getFirstIncompleteStep', () => {
    const completeBooking: Booking = {
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
      time_slots: [
        { documentId: 'id1' },
        { documentId: 'id2' },
        { documentId: 'id3' },
      ] as Booking['time_slots'],
      children: [
        {
          name: 'Anna',
          identification_trait: 'Blondes Haar',
          speech: 'Gedicht',
        },
      ],
      additional_notes: '',
    };

    it('should return 0 when contact incomplete', () => {
      const booking = {
        ...completeBooking,
        contact_person: {
          first_name: '',
          last_name: '',
          email: '',
          phone_number: '',
        },
      };
      expect(getFirstIncompleteStep(booking, 3)).toBe(0);
    });

    it('should return 1 when address incomplete', () => {
      const booking = {
        ...completeBooking,
        location: {
          street: '',
          house_number: '',
          zip_code: '',
          place: '',
        },
      };
      expect(getFirstIncompleteStep(booking, 3)).toBe(1);
    });

    it('should return 2 when time slots incomplete', () => {
      const booking = {
        ...completeBooking,
        time_slots: [] as Booking['time_slots'],
      };
      expect(getFirstIncompleteStep(booking, 3)).toBe(2);
    });

    it('should return 3 when children incomplete', () => {
      const booking = {
        ...completeBooking,
        children: [],
      };
      expect(getFirstIncompleteStep(booking, 3)).toBe(3);
    });

    it('should return 4 when all steps complete', () => {
      expect(getFirstIncompleteStep(completeBooking, 3)).toBe(4);
    });

    it('should use default maxTimeSlots of 3', () => {
      const booking = {
        ...completeBooking,
        time_slots: [{ documentId: 'id1' }] as Booking['time_slots'],
      };
      expect(getFirstIncompleteStep(booking)).toBe(2);
    });
  });

  describe('calculateStepCompletionStatus', () => {
    const completeBooking: Booking = {
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
      time_slots: [
        { documentId: 'id1' },
        { documentId: 'id2' },
        { documentId: 'id3' },
      ] as Booking['time_slots'],
      children: [
        {
          name: 'Anna',
          identification_trait: 'Blondes Haar',
          speech: 'Gedicht',
        },
      ],
      additional_notes: '',
    };

    const mockDerivedStores: DerivedStores = {
      canEditRoutePlanning: true,
      canEditAnything: true,
      isRoutePlanningFilled: true,
      isEverythingFilled: true,
    };

    it('should calculate status for complete booking', () => {
      const status = calculateStepCompletionStatus(completeBooking, 3, mockDerivedStores);
      expect(status).toHaveLength(5);
      expect(status[0]).toEqual({ allFilled: true, anyFilled: true }); // Contact
      expect(status[1]).toEqual({ allFilled: true, anyFilled: true }); // Address
      expect(status[2]).toEqual({ allFilled: true, anyFilled: true }); // Time slots
      expect(status[3]).toEqual({ allFilled: true, anyFilled: true }); // Children
      expect(status[4]).toEqual({ allFilled: true, anyFilled: false }); // Summary
    });

    it('should calculate status for incomplete contact', () => {
      const booking = {
        ...completeBooking,
        contact_person: {
          first_name: 'Max',
          last_name: '',
          email: '',
          phone_number: '',
        },
      };
      const status = calculateStepCompletionStatus(booking, 3, mockDerivedStores);
      expect(status[0]).toEqual({ allFilled: false, anyFilled: true });
    });

    it('should calculate status for empty booking', () => {
      const emptyBooking: Booking = {
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
      const emptyDerivedStores: DerivedStores = {
        canEditRoutePlanning: true,
        canEditAnything: true,
        isRoutePlanningFilled: false,
        isEverythingFilled: false,
      };
      const status = calculateStepCompletionStatus(emptyBooking, 3, emptyDerivedStores);
      expect(status[0]).toEqual({ allFilled: false, anyFilled: false });
      expect(status[1]).toEqual({ allFilled: false, anyFilled: false });
      expect(status[2]).toEqual({ allFilled: false, anyFilled: false });
      expect(status[3]).toEqual({ allFilled: false, anyFilled: false });
      expect(status[4]).toEqual({ allFilled: false, anyFilled: false });
    });

    it('should mark children as anyFilled when additional_notes present', () => {
      const booking = {
        ...completeBooking,
        children: [],
        additional_notes: 'Some notes',
      };
      const status = calculateStepCompletionStatus(booking, 3, mockDerivedStores);
      expect(status[3]).toEqual({ allFilled: false, anyFilled: true });
    });
  });
});
