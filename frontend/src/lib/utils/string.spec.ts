/**
 * Unit tests for string utilities
 */

import { describe, expect, it } from 'vitest';
import { isFilled, trim } from './string';

describe('string utilities', () => {
  describe('trim', () => {
    it('should trim whitespace from both ends', () => {
      expect(trim('  hello  ')).toBe('hello');
      expect(trim('\thello\t')).toBe('hello');
      expect(trim('\nhello\n')).toBe('hello');
    });

    it('should remove soft hyphens (\\u00AD)', () => {
      expect(trim('\u00ADhello\u00AD')).toBe('hello');
      expect(trim('  \u00ADhello\u00AD  ')).toBe('hello');
    });

    it('should handle null and undefined', () => {
      expect(trim(null)).toBe('');
      expect(trim(undefined)).toBe('');
    });

    it('should handle empty string', () => {
      expect(trim('')).toBe('');
      expect(trim('   ')).toBe('');
    });

    it('should preserve middle whitespace', () => {
      expect(trim('  hello world  ')).toBe('hello world');
    });

    it('should remove multiple soft hyphens', () => {
      expect(trim('\u00AD\u00ADhello\u00AD\u00AD')).toBe('hello');
    });

    it('should remove soft hyphens from middle of text', () => {
      expect(trim('hello\u00ADworld')).toBe('helloworld');
      expect(trim('hel\u00ADlo\u00ADworld')).toBe('helloworld');
    });
  });

  describe('isFilled', () => {
    it('should return true for non-empty strings', () => {
      expect(isFilled('hello')).toBe(true);
      expect(isFilled('  hello  ')).toBe(true);
      expect(isFilled('0')).toBe(true);
    });

    it('should return false for empty strings', () => {
      expect(isFilled('')).toBe(false);
      expect(isFilled('   ')).toBe(false);
      expect(isFilled('\t\n')).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isFilled(null)).toBe(false);
      expect(isFilled(undefined)).toBe(false);
    });

    it('should return false for strings with only soft hyphens', () => {
      expect(isFilled('\u00AD')).toBe(false);
      expect(isFilled('\u00AD\u00AD')).toBe(false);
      expect(isFilled('  \u00AD  ')).toBe(false);
    });

    it('should return true for strings with soft hyphens and content', () => {
      expect(isFilled('\u00ADhello\u00AD')).toBe(true);
    });
  });
});
