import { describe, expect, it, beforeEach } from 'vitest';
import { validationStore } from './validationStore.svelte';

describe('validationStore', () => {
  beforeEach(() => {
    validationStore.reset();
  });

  it('should have empty messages initially', () => {
    expect(validationStore.messages).toEqual({});
  });

  it('should set validation message for a field', () => {
    validationStore.setMessage('email', 'Invalid email address');

    expect(validationStore.messages['email']).toBe('Invalid email address');
  });

  it('should set multiple validation messages', () => {
    const messages = {
      email: 'Invalid email address',
      phone: 'Phone number required',
      name: 'Name is too short',
    };

    validationStore.setMessages(messages);

    expect(validationStore.messages).toEqual(messages);
  });

  it('should overwrite previous messages when setting new messages', () => {
    validationStore.setMessage('email', 'Old error');
    validationStore.setMessages({
      phone: 'New error',
    });

    expect(validationStore.messages).toEqual({
      phone: 'New error',
    });
  });

  it('should clear validation message for a field', () => {
    validationStore.setMessages({
      email: 'Invalid email',
      phone: 'Invalid phone',
    });

    validationStore.clearMessage('email');

    expect(validationStore.messages).toEqual({
      phone: 'Invalid phone',
    });
  });

  it('should clear all validation messages', () => {
    validationStore.setMessages({
      email: 'Invalid email',
      phone: 'Invalid phone',
      name: 'Invalid name',
    });

    validationStore.clearAll();

    expect(validationStore.messages).toEqual({});
  });

  it('should check if field has validation error', () => {
    validationStore.setMessage('email', 'Invalid email');

    expect(validationStore.hasError('email')).toBe(true);
    expect(validationStore.hasError('phone')).toBe(false);
  });

  it('should get validation message for a field', () => {
    validationStore.setMessage('email', 'Invalid email address');

    expect(validationStore.getMessage('email')).toBe('Invalid email address');
    expect(validationStore.getMessage('phone')).toBeUndefined();
  });

  it('should handle multiple set and clear operations', () => {
    validationStore.setMessage('email', 'Error 1');
    validationStore.setMessage('phone', 'Error 2');

    expect(validationStore.messages).toEqual({
      email: 'Error 1',
      phone: 'Error 2',
    });

    validationStore.clearMessage('email');

    expect(validationStore.messages).toEqual({
      phone: 'Error 2',
    });

    validationStore.setMessage('name', 'Error 3');

    expect(validationStore.messages).toEqual({
      phone: 'Error 2',
      name: 'Error 3',
    });
  });

  it('should reset to default state', () => {
    validationStore.setMessages({
      email: 'Error 1',
      phone: 'Error 2',
      name: 'Error 3',
    });

    validationStore.reset();

    expect(validationStore.messages).toEqual({});
  });

  it('should handle clearing non-existent field gracefully', () => {
    validationStore.setMessage('email', 'Error');
    validationStore.clearMessage('nonexistent');

    expect(validationStore.messages).toEqual({
      email: 'Error',
    });
  });

  it('should update existing field message', () => {
    validationStore.setMessage('email', 'Old error');
    validationStore.setMessage('email', 'New error');

    expect(validationStore.messages['email']).toBe('New error');
  });
});
