/**
 * Unit tests for object utilities
 */

import { describe, expect, it } from 'vitest';
import { clone, extendExistingObjectKeys, updateExistingObjectKeys } from './object';

describe('object utilities', () => {
  describe('clone', () => {
    it('should deep clone a simple object', () => {
      const obj = { a: 1, b: 2 };
      const cloned = clone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
    });

    it('should deep clone nested objects', () => {
      const obj = { a: { b: { c: 1 } } };
      const cloned = clone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned.a).not.toBe(obj.a);
      expect(cloned.a.b).not.toBe(obj.a.b);
    });

    it('should clone arrays', () => {
      const arr = [1, 2, { a: 3 }];
      const cloned = clone(arr);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[2]).not.toBe(arr[2]);
    });

    it('should handle primitives', () => {
      expect(clone(123)).toBe(123);
      expect(clone('hello')).toBe('hello');
      expect(clone(true)).toBe(true);
      expect(clone(null)).toBe(null);
    });
  });

  describe('updateExistingObjectKeys', () => {
    it('should update existing string keys', () => {
      const obj = { name: 'old', age: '30' };
      updateExistingObjectKeys(obj, { name: 'new', age: '40' });
      expect(obj.name).toBe('new');
      expect(obj.age).toBe('40');
    });

    it('should not add new keys', () => {
      const obj = { name: 'test' };
      updateExistingObjectKeys(obj, { name: 'updated', newKey: 'value' });
      expect(obj.name).toBe('updated');
      expect(obj).not.toHaveProperty('newKey');
    });

    it('should replace arrays', () => {
      const obj = { items: [1, 2, 3] };
      updateExistingObjectKeys(obj, { items: [4, 5] });
      expect(obj.items).toEqual([4, 5]);
    });

    it('should update nested objects recursively', () => {
      const obj = { person: { name: 'old', age: 30 } };
      updateExistingObjectKeys(obj, { person: { name: 'new' } });
      expect(obj.person.name).toBe('new');
      expect(obj.person.age).toBe(30); // Unchanged
    });

    it('should handle Date conversion', () => {
      const obj = { date: new Date('2024-01-01') };
      updateExistingObjectKeys(obj, { date: '2024-12-31' });
      expect(obj.date).toBeInstanceOf(Date);
      expect(obj.date.toISOString()).toContain('2024-12-31');
    });

    it('should convert to string for string properties', () => {
      const obj = { text: 'hello' };
      updateExistingObjectKeys(obj, { text: 123 });
      expect(obj.text).toBe('123');
    });

    it('should skip empty string (falsy) values', () => {
      const obj = { text: 'hello' };
      updateExistingObjectKeys(obj, { text: '' });
      // Empty string is falsy, so it won't update
      expect(obj.text).toBe('hello');
    });

    it('should update empty string (falsy) values when updateWhenEmpty is true', () => {
      const obj = { text: 'hello' };
      updateExistingObjectKeys(obj, { text: '' }, true);
      expect(obj.text).toBe('');
    });

    it('should update zero (falsy) values', () => {
      const obj = { count: 5 };
      updateExistingObjectKeys(obj, { count: 0 });
      expect(obj.count).toBe(0);
    });

    it('should update false values', () => {
      const obj = { flag: true };
      updateExistingObjectKeys(obj, { flag: false });
      expect(obj.flag).toBe(false);
    });

    it('should handle non-empty string conversion', () => {
      const obj = { text: 'hello' };
      updateExistingObjectKeys(obj, { text: 'world' });
      expect(obj.text).toBe('world');
    });

    it('should clone other types (numbers, booleans)', () => {
      const obj = { count: 0, flag: false };
      updateExistingObjectKeys(obj, { count: 42, flag: true });
      expect(obj.count).toBe(42);
      expect(obj.flag).toBe(true);
    });

    it('should skip null/falsy values', () => {
      const obj = { text: 'hello' };
      updateExistingObjectKeys(obj, { text: null });
      // null is falsy, so it won't update
      expect(obj.text).toBe('hello');
    });

    it('should update null (falsy) values when updateWhenEmpty is true', () => {
      const obj = { text: 'hello' };
      updateExistingObjectKeys(obj, { text: null }, true);
      expect(obj.text).toBe('');
    });
  });

  describe('extendExistingObjectKeys', () => {
    it('should concatenate arrays', () => {
      const obj = { items: [1, 2] };
      extendExistingObjectKeys(obj, { items: [3, 4] });
      expect(obj.items).toEqual([1, 2, 3, 4]);
    });

    it('should concatenate strings with space', () => {
      const obj = { text: 'hello' };
      extendExistingObjectKeys(obj, { text: 'world' });
      expect(obj.text).toBe('hello world');
    });

    it('should concatenate strings and trim result', () => {
      const obj = { text: 'hello' };
      extendExistingObjectKeys(obj, { text: 'world' });
      // Concatenates with space then trims the final result
      expect(obj.text).toBe('hello world');
    });

    it('should handle empty string concatenation', () => {
      const obj = { text: 'hello' };
      extendExistingObjectKeys(obj, { text: '' });
      expect(obj.text).toBe('hello');
    });

    it('should not add new keys', () => {
      const obj = { existing: 'value' };
      extendExistingObjectKeys(obj, { newKey: 'value' });
      expect(obj).not.toHaveProperty('newKey');
    });

    it('should recursively extend nested objects', () => {
      const obj = { person: { tags: ['tag1'] } };
      extendExistingObjectKeys(obj, { person: { tags: ['tag2'] } });
      expect(obj.person.tags).toEqual(['tag1', 'tag2']);
    });

    it('should throw error for unknown key types', () => {
      const obj = { num: 123 };
      expect(() => {
        extendExistingObjectKeys(obj, { num: 456 });
      }).toThrow('Unknown key type');
    });

    it('should skip undefined keys in obj', () => {
      const obj = { existing: 'value' };
      extendExistingObjectKeys(obj, { nonExisting: 'value' });
      expect(obj).not.toHaveProperty('nonExisting');
    });
  });
});
