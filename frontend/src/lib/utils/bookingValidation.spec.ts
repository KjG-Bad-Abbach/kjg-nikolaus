import { describe, expect, it } from 'vitest';
import {
  getValidationMessagesForSteps,
  validateContactPerson,
  validateAddress,
  validateTimeSlots,
  validateChildren,
  extractApiValidationErrors,
  trimContactPerson,
  trimLocation,
  trimChildren,
} from './bookingValidation';
import type { ContactPerson, Location, Child, ApiError } from '$lib/types/booking';

describe('bookingValidation', () => {
  describe('getValidationMessagesForSteps', () => {
    it('should convert single string messages to arrays', () => {
      const messages = {
        'booking.contact_person.first_name': 'Error 1',
        'booking.location.street': 'Error 2',
      };

      const result = getValidationMessagesForSteps(messages);

      expect(result).toEqual({
        'booking.contact_person.first_name': ['Error 1'],
        'booking.location.street': ['Error 2'],
      });
    });

    it('should handle empty messages object', () => {
      const result = getValidationMessagesForSteps({});
      expect(result).toEqual({});
    });
  });

  describe('validateContactPerson', () => {
    it('should return no errors for valid contact', () => {
      const contact: ContactPerson = {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123 456789',
      };

      const errors = validateContactPerson(contact);
      expect(errors).toEqual({});
    });

    it('should return error for missing first_name', () => {
      const contact: ContactPerson = {
        first_name: '',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123 456789',
      };

      const errors = validateContactPerson(contact);
      expect(errors['booking.contact_person.first_name']).toBe('Eingabe ist erforderlich.');
    });

    it('should return error for whitespace-only first_name', () => {
      const contact: ContactPerson = {
        first_name: '   ',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '+49 123 456789',
      };

      const errors = validateContactPerson(contact);
      expect(errors['booking.contact_person.first_name']).toBe('Eingabe ist erforderlich.');
    });

    it('should return error for missing last_name', () => {
      const contact: ContactPerson = {
        first_name: 'Max',
        last_name: '',
        email: 'max@example.com',
        phone_number: '+49 123 456789',
      };

      const errors = validateContactPerson(contact);
      expect(errors['booking.contact_person.last_name']).toBe('Eingabe ist erforderlich.');
    });

    it('should return error for missing email', () => {
      const contact: ContactPerson = {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: '',
        phone_number: '+49 123 456789',
      };

      const errors = validateContactPerson(contact);
      expect(errors['booking.contact_person.email']).toBe('Eingabe ist erforderlich.');
    });

    it('should return error for missing phone_number', () => {
      const contact: ContactPerson = {
        first_name: 'Max',
        last_name: 'Mustermann',
        email: 'max@example.com',
        phone_number: '',
      };

      const errors = validateContactPerson(contact);
      expect(errors['booking.contact_person.phone_number']).toBe('Eingabe ist erforderlich.');
    });

    it('should return multiple errors for multiple missing fields', () => {
      const contact: ContactPerson = {
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
      };

      const errors = validateContactPerson(contact);
      expect(Object.keys(errors)).toHaveLength(4);
      expect(errors['booking.contact_person.first_name']).toBe('Eingabe ist erforderlich.');
      expect(errors['booking.contact_person.last_name']).toBe('Eingabe ist erforderlich.');
      expect(errors['booking.contact_person.email']).toBe('Eingabe ist erforderlich.');
      expect(errors['booking.contact_person.phone_number']).toBe('Eingabe ist erforderlich.');
    });
  });

  describe('validateAddress', () => {
    const validLocation: Location = {
      street: 'Hauptstraße',
      house_number: '123',
      zip_code: '12345',
      place: 'München',
    };

    it('should return no errors for valid address when route planning allowed', () => {
      const errors = validateAddress(validLocation, 'Wohnzimmer', true);
      expect(errors).toEqual({});
    });

    it('should return no errors for valid present_location when route planning not allowed', () => {
      const errors = validateAddress(validLocation, 'Wohnzimmer', false);
      expect(errors).toEqual({});
    });

    it('should return error for missing present_location when route planning not allowed', () => {
      const errors = validateAddress(validLocation, '', false);
      expect(errors['booking.present_location']).toBe('Eingabe ist erforderlich.');
    });

    it('should return error for missing street when route planning allowed', () => {
      const location = { ...validLocation, street: '' };
      const errors = validateAddress(location, 'Wohnzimmer', true);
      expect(errors['booking.location.street']).toBe('Eingabe ist erforderlich.');
    });

    it('should return error for missing house_number when route planning allowed', () => {
      const location = { ...validLocation, house_number: '' };
      const errors = validateAddress(location, 'Wohnzimmer', true);
      expect(errors['booking.location.house_number']).toBe('Eingabe ist erforderlich.');
    });

    it('should return error for missing zip_code when route planning allowed', () => {
      const location = { ...validLocation, zip_code: '' };
      const errors = validateAddress(location, 'Wohnzimmer', true);
      expect(errors['booking.location.zip_code']).toBe('Eingabe ist erforderlich.');
    });

    it('should return error for missing place when route planning allowed', () => {
      const location = { ...validLocation, place: '' };
      const errors = validateAddress(location, 'Wohnzimmer', true);
      expect(errors['booking.location.place']).toBe('Eingabe ist erforderlich.');
    });

    it('should return error for missing present_location when route planning allowed', () => {
      const errors = validateAddress(validLocation, '', true);
      expect(errors['booking.present_location']).toBe('Eingabe ist erforderlich.');
    });

    it('should not validate location fields when route planning not allowed', () => {
      const emptyLocation: Location = {
        street: '',
        house_number: '',
        zip_code: '',
        place: '',
      };
      const errors = validateAddress(emptyLocation, 'Wohnzimmer', false);
      expect(errors).toEqual({});
    });
  });

  describe('validateTimeSlots', () => {
    it('should return no errors when enough slots selected', () => {
      const errors = validateTimeSlots(['id1', 'id2', 'id3'], 3);
      expect(errors).toEqual({});
    });

    it('should return error when not enough slots selected', () => {
      const errors = validateTimeSlots(['id1', 'id2'], 3);
      expect(errors['booking.time_slots']).toBe('Bitte wähle 3 Zeitslots aus.');
    });

    it('should return error when no slots selected', () => {
      const errors = validateTimeSlots([], 3);
      expect(errors['booking.time_slots']).toBe('Bitte wähle 3 Zeitslots aus.');
    });

    it('should use custom maxTimeSlots value', () => {
      const errors = validateTimeSlots(['id1'], 2);
      expect(errors['booking.time_slots']).toBe('Bitte wähle 2 Zeitslots aus.');
    });
  });

  describe('validateChildren', () => {
    const validChild: Child = {
      name: 'Anna',
      identification_trait: 'Blondes Haar',
      speech: 'Gedicht',
    };

    it('should return no errors for valid children', () => {
      const errors = validateChildren([validChild]);
      expect(errors).toEqual({});
    });

    it('should return error when no children provided', () => {
      const errors = validateChildren([]);
      expect(errors['booking.children']).toBe('Bitte füge mindestens ein Kind hinzu.');
    });

    it('should return error for missing child name', () => {
      const child = { ...validChild, name: '' };
      const errors = validateChildren([child]);
      expect(errors['booking.children.0.name']).toBe('Eingabe ist erforderlich.');
    });

    it('should return error for missing identification_trait', () => {
      const child = { ...validChild, identification_trait: '' };
      const errors = validateChildren([child]);
      expect(errors['booking.children.0.identification_trait']).toBe('Eingabe ist erforderlich.');
    });

    it('should return error for missing speech', () => {
      const child = { ...validChild, speech: '' };
      const errors = validateChildren([child]);
      expect(errors['booking.children.0.speech']).toBe('Eingabe ist erforderlich.');
    });

    it('should return errors for multiple children with correct indices', () => {
      const children = [
        { name: 'Anna', identification_trait: '', speech: 'Gedicht' },
        { name: '', identification_trait: 'Blondes Haar', speech: '' },
      ];
      const errors = validateChildren(children);
      expect(errors['booking.children.0.identification_trait']).toBe('Eingabe ist erforderlich.');
      expect(errors['booking.children.1.name']).toBe('Eingabe ist erforderlich.');
      expect(errors['booking.children.1.speech']).toBe('Eingabe ist erforderlich.');
    });
  });

  describe('extractApiValidationErrors', () => {
    it('should extract validation errors from API response', () => {
      const apiError: ApiError = {
        message: 'Validation failed',
        body: {
          error: {
            details: {
              errors: [
                { path: ['contact_person', 'email'], message: 'Invalid email' },
                { path: ['location', 'zip_code'], message: 'Invalid zip code' },
              ],
            },
          },
        },
      };

      const errors = extractApiValidationErrors(apiError);
      expect(errors['booking.contact_person.email']).toBe('Invalid email');
      expect(errors['booking.location.zip_code']).toBe('Invalid zip code');
    });

    it('should remove redundant path prefix from message', () => {
      const apiError: ApiError = {
        message: 'Validation failed',
        body: {
          error: {
            details: {
              errors: [
                {
                  path: ['contact_person', 'email'],
                  message: 'contact_person.email must be a valid email',
                },
              ],
            },
          },
        },
      };

      const errors = extractApiValidationErrors(apiError);
      expect(errors['booking.contact_person.email']).toBe('must be a valid email');
    });

    it('should translate phone number validation message', () => {
      const apiError: ApiError = {
        message: 'Validation failed',
        body: {
          error: {
            details: {
              errors: [
                {
                  path: ['contact_person', 'phone_number'],
                  message: 'must match the following: "/^\\+?[-\\s\\.0-9]+$/"',
                },
              ],
            },
          },
        },
      };

      const errors = extractApiValidationErrors(apiError);
      expect(errors['booking.contact_person.phone_number']).toBe(
        "Die Telefonnummer muss im Format '01234 56789', '01234 567-89', '+49 123 456789' oder '0049 123 456789' sein.",
      );
    });

    it('should return empty object when no validation errors', () => {
      const apiError: ApiError = {
        message: 'Network error',
      };

      const errors = extractApiValidationErrors(apiError);
      expect(errors).toEqual({});
    });

    it('should handle empty errors array', () => {
      const apiError: ApiError = {
        message: 'Validation failed',
        body: {
          error: {
            details: {
              errors: [],
            },
          },
        },
      };

      const errors = extractApiValidationErrors(apiError);
      expect(errors).toEqual({});
    });
  });

  describe('trimContactPerson', () => {
    it('should trim all contact fields', () => {
      const contact: ContactPerson = {
        first_name: '  Max  ',
        last_name: '  Mustermann  ',
        email: '  max@example.com  ',
        phone_number: '  +49 123  ',
      };

      trimContactPerson(contact);

      expect(contact.first_name).toBe('Max');
      expect(contact.last_name).toBe('Mustermann');
      expect(contact.email).toBe('max@example.com');
      expect(contact.phone_number).toBe('+49 123');
    });
  });

  describe('trimLocation', () => {
    it('should trim all location fields', () => {
      const location: Location = {
        street: '  Hauptstraße  ',
        house_number: '  123  ',
        zip_code: '  12345  ',
        place: '  München  ',
      };

      trimLocation(location);

      expect(location.street).toBe('Hauptstraße');
      expect(location.house_number).toBe('123');
      expect(location.zip_code).toBe('12345');
      expect(location.place).toBe('München');
    });
  });

  describe('trimChildren', () => {
    it('should trim all child fields', () => {
      const children: Child[] = [
        {
          name: '  Anna  ',
          identification_trait: '  Blondes Haar  ',
          speech: '  Gedicht  ',
        },
        {
          name: '  Max  ',
          identification_trait: '  Brille  ',
          speech: '  Lied  ',
        },
      ];

      trimChildren(children);

      expect(children[0].name).toBe('Anna');
      expect(children[0].identification_trait).toBe('Blondes Haar');
      expect(children[0].speech).toBe('Gedicht');
      expect(children[1].name).toBe('Max');
      expect(children[1].identification_trait).toBe('Brille');
      expect(children[1].speech).toBe('Lied');
    });

    it('should handle empty children array', () => {
      const children: Child[] = [];
      trimChildren(children);
      expect(children).toEqual([]);
    });
  });
});
