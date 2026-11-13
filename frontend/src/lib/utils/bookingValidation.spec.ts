import { describe, expect, it } from 'vitest';
import {
  getValidationMessagesForSteps,
  validateContactPerson,
  validateAddress,
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

    it('validateAddress_ValidLocation_Expect_NoErrors', () => {
      // Arrange
      // Act
      const errors = validateAddress(validLocation);
      // Assert
      expect(errors).toEqual({});
    });

    it.each(['street', 'house_number', 'zip_code', 'place'] as const)(
      'validateAddress_MissingField%s_Expect_RequiredFieldError',
      (field) => {
        // Arrange
        const location = { ...validLocation, [field]: '' };
        // Act
        const errors = validateAddress(location);
        // Assert
        expect(errors[`booking.location.${field}`]).toBe('Eingabe ist erforderlich.');
      },
    );

    it('validateAddress_EmptyLocation_Expect_AllRequiredFieldErrors', () => {
      // Arrange
      const emptyLocation: Location = {
        street: '',
        house_number: '',
        zip_code: '',
        place: '',
      };
      // Act
      const errors = validateAddress(emptyLocation);
      // Assert
      expect(errors).toEqual({
        'booking.location.street': 'Eingabe ist erforderlich.',
        'booking.location.house_number': 'Eingabe ist erforderlich.',
        'booking.location.zip_code': 'Eingabe ist erforderlich.',
        'booking.location.place': 'Eingabe ist erforderlich.',
      });
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

    it('validateChildren_EmptyChildren_Expect_SaveAllowed', () => {
      // Arrange
      // Act
      const errors = validateChildren([]);
      // Assert
      expect(errors).toEqual({});
    });

    it('should return error for missing child name', () => {
      // Arrange
      const child = { ...validChild, name: '' };
      // Act
      const errors = validateChildren([child]);
      // Assert
      expect(errors['booking.children[0].name']).toBe('Eingabe ist erforderlich.');
    });

    it('validateChildren_MissingIdentification_Expect_SaveAllowed', () => {
      // Arrange
      const child = { ...validChild, identification_trait: '' };
      // Act
      const errors = validateChildren([child]);
      // Assert
      expect(errors).toEqual({});
    });

    it('validateChildren_MissingSpeech_Expect_SaveAllowed', () => {
      // Arrange
      const child = { ...validChild, speech: '' };
      // Act
      const errors = validateChildren([child]);
      // Assert
      expect(errors).toEqual({});
    });

    it('should return errors for multiple children with correct indices', () => {
      // Arrange
      const children = [
        { name: 'Anna', identification_trait: '', speech: 'Gedicht' },
        { name: '', identification_trait: 'Blondes Haar', speech: '' },
      ];
      // Act
      const errors = validateChildren(children);
      // Assert
      expect(errors).toEqual({ 'booking.children[1].name': 'Eingabe ist erforderlich.' });
    });
  });

  describe('extractApiValidationErrors', () => {
    it('extractApiValidationErrors_RepeatedPath_Expect_AllMessagesInOrder', () => {
      // Arrange
      const path = ['location', 'zip_code'];
      const messages = ['must be at least 5 characters', 'must contain only digits', 'invalid ZIP'];
      const apiError: ApiError = {
        message: 'Validation failed',
        body: { error: { details: { errors: messages.map((message) => ({ path, message })) } } },
      };
      // Act
      const errors = extractApiValidationErrors(apiError);
      // Assert
      expect(errors).toEqual({ 'booking.location.zip_code': messages });
    });

    it.each(['0', '[0]'])('extractApiValidationErrors_ChildIndex%s_Expect_FieldPath', (index) => {
      // Arrange
      const path = index === '0' ? ['children', index, 'speech'] : [`children${index}`, 'speech'];
      const apiError: ApiError = {
        message: 'Validation failed',
        body: { error: { details: { errors: [{ path, message: `${path.join('.')} too long` }] } } },
      };
      // Act
      const errors = extractApiValidationErrors(apiError);
      // Assert
      expect(errors).toEqual({ 'booking.children[0].speech': 'too long' });
    });
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
