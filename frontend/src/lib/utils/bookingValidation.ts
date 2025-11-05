/**
 * Booking Validation Utilities
 * Pure functions for validating booking data
 */

import { isFilled, trim } from './string';
import type {
  ContactPerson,
  Location,
  Child,
  ApiError,
  ValidationMessages,
} from '$lib/types/booking';

/**
 * Convert validation messages from store format (Record<string, string>) to component format (Record<string, string[]>)
 */
export function getValidationMessagesForSteps(
  messages: ValidationMessages,
): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(messages)) {
    result[key] = [value];
  }
  return result;
}

/**
 * Validate contact person fields
 * @returns Object with validation errors (field path -> error message)
 */
export function validateContactPerson(contact: ContactPerson): Record<string, string> {
  const errors: Record<string, string> = {};

  const trimmedContact = {
    first_name: trim(contact.first_name),
    last_name: trim(contact.last_name),
    email: trim(contact.email),
    phone_number: trim(contact.phone_number),
  };

  if (!isFilled(trimmedContact.first_name)) {
    errors['booking.contact_person.first_name'] = 'Eingabe ist erforderlich.';
  }
  if (!isFilled(trimmedContact.last_name)) {
    errors['booking.contact_person.last_name'] = 'Eingabe ist erforderlich.';
  }
  if (!isFilled(trimmedContact.email)) {
    errors['booking.contact_person.email'] = 'Eingabe ist erforderlich.';
  }
  if (!isFilled(trimmedContact.phone_number)) {
    errors['booking.contact_person.phone_number'] = 'Eingabe ist erforderlich.';
  }

  return errors;
}

/**
 * Validate address fields
 * @returns Object with validation errors (field path -> error message)
 */
export function validateAddress(
  location: Location,
  presentLocation: string,
  canEditRoutePlanning: boolean,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const trimmedLocation = {
    street: trim(location.street),
    house_number: trim(location.house_number),
    zip_code: trim(location.zip_code),
    place: trim(location.place),
  };
  const trimmedPresentLocation = trim(presentLocation);

  if (!canEditRoutePlanning) {
    // After route planning deadline, only present_location can be edited
    if (!isFilled(trimmedPresentLocation)) {
      errors['booking.present_location'] = 'Eingabe ist erforderlich.';
    }
  } else {
    // Before route planning deadline, all fields required
    if (!isFilled(trimmedLocation.street)) {
      errors['booking.location.street'] = 'Eingabe ist erforderlich.';
    }
    if (!isFilled(trimmedLocation.house_number)) {
      errors['booking.location.house_number'] = 'Eingabe ist erforderlich.';
    }
    if (!isFilled(trimmedLocation.zip_code)) {
      errors['booking.location.zip_code'] = 'Eingabe ist erforderlich.';
    }
    if (!isFilled(trimmedLocation.place)) {
      errors['booking.location.place'] = 'Eingabe ist erforderlich.';
    }
    if (!isFilled(trimmedPresentLocation)) {
      errors['booking.present_location'] = 'Eingabe ist erforderlich.';
    }
  }

  return errors;
}

/**
 * Validate time slot selection
 * @returns Object with validation errors (field path -> error message)
 */
export function validateTimeSlots(
  selectedTimeSlotIds: string[],
  maxTimeSlots: number,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (selectedTimeSlotIds.length < maxTimeSlots) {
    errors['booking.time_slots'] = `Bitte wähle ${maxTimeSlots} Zeitslots aus.`;
  }

  return errors;
}

/**
 * Validate children fields
 * @returns Object with validation errors (field path -> error message)
 */
export function validateChildren(children: Child[]): Record<string, string> {
  const errors: Record<string, string> = {};

  if (children.length === 0) {
    errors['booking.children'] = 'Bitte füge mindestens ein Kind hinzu.';
    return errors;
  }

  children.forEach((child, index) => {
    const trimmedChild = {
      name: trim(child.name),
      identification_trait: trim(child.identification_trait),
      speech: trim(child.speech),
    };

    if (!isFilled(trimmedChild.name)) {
      errors[`booking.children.${index}.name`] = 'Eingabe ist erforderlich.';
    }
    if (!isFilled(trimmedChild.identification_trait)) {
      errors[`booking.children.${index}.identification_trait`] = 'Eingabe ist erforderlich.';
    }
    if (!isFilled(trimmedChild.speech)) {
      errors[`booking.children.${index}.speech`] = 'Eingabe ist erforderlich.';
    }
  });

  return errors;
}

/**
 * Extract validation errors from API error response
 * Converts Strapi validation error format to our validation message format
 */
export function extractApiValidationErrors(apiError: ApiError): Record<string, string> {
  const errors: Record<string, string> = {};
  const validationErrors = apiError.body?.error?.details?.errors;

  if (validationErrors?.length) {
    for (const err of validationErrors) {
      const path = `booking.${err.path.join('.')}`;
      let message = err.message;

      // Remove redundant path prefix from message
      if (message.startsWith(err.path.join('.') + ' ')) {
        message = message.substring((err.path.join('.') + ' ').length);
      }

      // Translate phone number validation message
      if (message === 'must match the following: "/^\\+?[-\\s\\.0-9]+$/"') {
        message =
          "Die Telefonnummer muss im Format '01234 56789', '01234 567-89', '+49 123 456789' oder '0049 123 456789' sein.";
      }

      errors[path] = message;
    }
  }

  return errors;
}

/**
 * Trim all fields in contact person object (mutates input)
 */
export function trimContactPerson(contact: ContactPerson): void {
  contact.first_name = trim(contact.first_name);
  contact.last_name = trim(contact.last_name);
  contact.email = trim(contact.email);
  contact.phone_number = trim(contact.phone_number);
}

/**
 * Trim all fields in location object (mutates input)
 */
export function trimLocation(location: Location): void {
  location.street = trim(location.street);
  location.house_number = trim(location.house_number);
  location.zip_code = trim(location.zip_code);
  location.place = trim(location.place);
}

/**
 * Trim all child fields (mutates input)
 */
export function trimChildren(children: Child[]): void {
  children.forEach((child) => {
    child.name = trim(child.name);
    child.identification_trait = trim(child.identification_trait);
    child.speech = trim(child.speech);
  });
}
