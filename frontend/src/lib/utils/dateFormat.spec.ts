/**
 * Unit tests for date formatting utilities
 */

import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatDateTimeRange,
  formatTime,
  formatTimeSlotGroup,
} from './dateFormat';

describe('date formatting utilities', () => {
  describe('formatDate', () => {
    it('should format date without year if current year', () => {
      const date = new Date();
      date.setMonth(11); // December
      date.setDate(5);
      const result = formatDate(date);
      expect(result).toMatch(/^[A-Za-z]{2,3} \d{1,2}\.\d{1,2}\.$/);
      expect(result).not.toContain(date.getFullYear().toString());
    });

    it('should format date with year if different year', () => {
      const currentYear = new Date().getFullYear();
      const differentYear = currentYear + 1;
      const date = new Date(`${differentYear}-12-05T10:00:00`);
      const result = formatDate(date);
      expect(result).toMatch(new RegExp(`^[A-Za-z]{2,3} \\d{1,2}\\.\\d{1,2}\\.${differentYear}$`));
    });

    it('should use German locale for weekday', () => {
      // Create a known Friday: January 3, 2025 is a Friday
      const date = new Date('2025-01-03T10:00:00');
      const result = formatDate(date);
      expect(result).toMatch(/^Fr/);
    });

    it('should format single-digit day and month', () => {
      const currentYear = new Date().getFullYear();
      const date = new Date(`${currentYear}-01-05T10:00:00`);
      const result = formatDate(date);
      expect(result).toContain('5.1.');
    });
  });

  describe('formatTime', () => {
    it('should format time with leading zeros', () => {
      const date = new Date('2024-12-05T09:05:00');
      expect(formatTime(date)).toBe('09:05');
    });

    it('should format time without leading zeros when not needed', () => {
      const date = new Date('2024-12-05T19:30:00');
      expect(formatTime(date)).toBe('19:30');
    });

    it('should handle midnight', () => {
      const date = new Date('2024-12-05T00:00:00');
      expect(formatTime(date)).toBe('00:00');
    });

    it('should handle noon', () => {
      const date = new Date('2024-12-05T12:00:00');
      expect(formatTime(date)).toBe('12:00');
    });
  });

  describe('formatDateTime', () => {
    it('should combine date and time with "Uhr"', () => {
      const currentYear = new Date().getFullYear();
      const differentYear = currentYear + 1;
      const date = new Date(`${differentYear}-12-05T19:30:00`);
      const result = formatDateTime(date);
      expect(result).toMatch(
        new RegExp(`^[A-Za-z]{2,3} \\d{1,2}\\.\\d{1,2}\\.${differentYear} 19:30 Uhr$`),
      );
    });

    it('should format midnight correctly', () => {
      const currentYear = new Date().getFullYear();
      const date = new Date(`${currentYear}-12-05T00:00:00`);
      const result = formatDateTime(date);
      expect(result).toContain('00:00 Uhr');
    });
  });

  describe('formatDateTimeRange', () => {
    it('should format range on same day', () => {
      const currentYear = new Date().getFullYear();
      const differentYear = currentYear + 1;
      const start = new Date(`${differentYear}-12-05T19:30:00`);
      const end = new Date(`${differentYear}-12-05T20:30:00`);
      const result = formatDateTimeRange(start, end);
      expect(result).toMatch(
        new RegExp(`^[A-Za-z]{2,3} \\d{1,2}\\.\\d{1,2}\\.${differentYear} 19:30 - 20:30 Uhr$`),
      );
    });

    it('should include end date when dates differ', () => {
      const currentYear = new Date().getFullYear();
      const start = new Date(`${currentYear}-12-05T23:00:00`);
      const end = new Date(`${currentYear}-12-06T01:00:00`);
      const result = formatDateTimeRange(start, end);
      expect(result).toContain('23:00 -');
      expect(result).toContain('01:00 Uhr');
      // Should include end date
      expect(result).toMatch(/- [A-Za-z]{2,3} \d{1,2}\.\d{1,2}\./);
    });

    it('should handle different months', () => {
      const currentYear = new Date().getFullYear();
      const start = new Date(`${currentYear}-11-30T23:00:00`);
      const end = new Date(`${currentYear}-12-01T01:00:00`);
      const result = formatDateTimeRange(start, end);
      expect(result).toContain('30.11.');
      expect(result).toContain('1.12.');
    });

    it('should handle different years', () => {
      const currentYear = new Date().getFullYear();
      const year1 = currentYear + 1; // Use future year to ensure it's displayed
      const year2 = currentYear + 2;
      const start = new Date(`${year1}-12-31T23:00:00`);
      const end = new Date(`${year2}-01-01T01:00:00`);
      const result = formatDateTimeRange(start, end);
      expect(result).toContain(year1.toString());
      expect(result).toContain(year2.toString());
    });
  });

  describe('formatTimeSlotGroup', () => {
    it('should delegate to formatDate', () => {
      const currentYear = new Date().getFullYear();
      const date = new Date(`${currentYear}-12-05T19:30:00`);
      expect(formatTimeSlotGroup(date)).toBe(formatDate(date));
    });
  });
});
