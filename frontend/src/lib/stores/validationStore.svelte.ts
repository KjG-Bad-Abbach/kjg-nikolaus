/**
 * Validation messages store
 * Manages form validation error messages
 */

export interface ValidationMessages {
  [key: string]: string;
}

class ValidationStore {
  messages = $state<ValidationMessages>({});

  /**
   * Set validation message for a field
   */
  setMessage(field: string, message: string) {
    this.messages[field] = message;
  }

  /**
   * Set multiple validation messages
   */
  setMessages(messages: ValidationMessages) {
    this.messages = { ...messages };
  }

  /**
   * Clear validation message for a field
   */
  clearMessage(field: string) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [field]: _, ...rest } = this.messages;
    this.messages = rest;
  }

  /**
   * Clear all validation messages
   */
  clearAll() {
    this.messages = {};
  }

  /**
   * Check if field has validation error
   */
  hasError(field: string): boolean {
    return !!this.messages[field];
  }

  /**
   * Get validation message for a field
   */
  getMessage(field: string): string | undefined {
    return this.messages[field];
  }

  /**
   * Reset to default state
   */
  reset() {
    this.messages = {};
  }
}

export const validationStore = new ValidationStore();
export type { ValidationStore };
