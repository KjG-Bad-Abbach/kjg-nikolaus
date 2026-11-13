import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  handleContactChange,
  handleAddressChange,
  handleTimeSlotChange,
  handleChildrenChange,
} from './changeHandlers';
import type { ContactPerson, Location, Child } from '$lib/types/booking';
import type { BookingStore } from '$lib/stores/bookingStore.svelte';

describe('changeHandlers', () => {
  let mockBookingStore: BookingStore;

  beforeEach(() => {
    mockBookingStore = {
      updateField: vi.fn(),
      setSelectedTimeSlotIds: vi.fn(),
    } as unknown as BookingStore;
  });

  describe('handleContactChange', () => {
    it('should update contact_person field in booking store', () => {
      const contact: ContactPerson = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone_number: '1234567890',
      };

      handleContactChange(contact, mockBookingStore);

      expect(mockBookingStore.updateField).toHaveBeenCalledWith('contact_person', contact);
    });

    it('should handle empty contact data', () => {
      const contact: ContactPerson = {
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
      };

      handleContactChange(contact, mockBookingStore);

      expect(mockBookingStore.updateField).toHaveBeenCalledWith('contact_person', contact);
    });
  });

  describe('handleAddressChange', () => {
    it('should update both location and present_location fields', () => {
      const location: Location = {
        street: 'Main St',
        house_number: '123',
        zip_code: '12345',
        place: 'Test City',
      };
      const presentLocation = 'Wohnung';

      handleAddressChange({ location, presentLocation }, mockBookingStore);

      expect(mockBookingStore.updateField).toHaveBeenCalledWith('location', location);
      expect(mockBookingStore.updateField).toHaveBeenCalledWith(
        'present_location',
        presentLocation,
      );
    });

    it('should handle location without coordinates', () => {
      const location: Location = {
        street: 'Oak Ave',
        house_number: '456',
        zip_code: '54321',
        place: 'Another City',
      };
      const presentLocation = '';

      handleAddressChange({ location, presentLocation }, mockBookingStore);

      expect(mockBookingStore.updateField).toHaveBeenCalledWith('location', location);
      expect(mockBookingStore.updateField).toHaveBeenCalledWith(
        'present_location',
        presentLocation,
      );
    });
  });

  describe('handleTimeSlotChange', () => {
    it('should update selected time slot IDs', () => {
      const selectedIds = ['slot1', 'slot2', 'slot3'];

      handleTimeSlotChange(selectedIds, mockBookingStore);

      expect(mockBookingStore.setSelectedTimeSlotIds).toHaveBeenCalledWith(selectedIds);
    });

    it('should handle empty selection', () => {
      const selectedIds: string[] = [];

      handleTimeSlotChange(selectedIds, mockBookingStore);

      expect(mockBookingStore.setSelectedTimeSlotIds).toHaveBeenCalledWith(selectedIds);
    });

    it('should handle single selection', () => {
      const selectedIds = ['slot1'];

      handleTimeSlotChange(selectedIds, mockBookingStore);

      expect(mockBookingStore.setSelectedTimeSlotIds).toHaveBeenCalledWith(selectedIds);
    });
  });

  describe('handleChildrenChange', () => {
    it('should update both children and additional_notes fields', () => {
      const children: Child[] = [
        { name: 'Alice Doe', identification_trait: 'Blonde hair', speech: 'Good behavior' },
        { name: 'Bob Doe', identification_trait: 'Brown hair', speech: 'Helpful at home' },
      ];
      const additionalNotes = 'Special requests here';

      handleChildrenChange({ children, additionalNotes }, mockBookingStore);

      expect(mockBookingStore.updateField).toHaveBeenCalledWith('children', children);
      expect(mockBookingStore.updateField).toHaveBeenCalledWith(
        'additional_notes',
        additionalNotes,
      );
    });

    it('should handle empty children array', () => {
      const children: Child[] = [];
      const additionalNotes = '';

      handleChildrenChange({ children, additionalNotes }, mockBookingStore);

      expect(mockBookingStore.updateField).toHaveBeenCalledWith('children', children);
      expect(mockBookingStore.updateField).toHaveBeenCalledWith(
        'additional_notes',
        additionalNotes,
      );
    });

    it('should handle children with minimal data', () => {
      const children: Child[] = [{ name: 'Charlie', identification_trait: '', speech: '' }];
      const additionalNotes = 'Some notes';

      handleChildrenChange({ children, additionalNotes }, mockBookingStore);

      expect(mockBookingStore.updateField).toHaveBeenCalledWith('children', children);
      expect(mockBookingStore.updateField).toHaveBeenCalledWith(
        'additional_notes',
        additionalNotes,
      );
    });
  });
});
