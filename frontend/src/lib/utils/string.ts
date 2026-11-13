/**
 * String utility functions
 * Migrated from Alpine.js frontend (lines 1921-1928)
 */

/**
 * Trims whitespace and soft hyphens from a string
 * Soft hyphen: \u00AD
 */
export function trim(value: string | null | undefined): string {
  return (value || '').replace(/^[\s\u00AD]+|\u00AD+|[\s\u00AD]+$/g, '');
}

/**
 * Checks if a string has content after trimming
 */
export function isFilled(value: string | null | undefined): boolean {
  return !!trim(value);
}
