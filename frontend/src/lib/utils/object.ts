/**
 * Object utility functions
 * Migrated from Alpine.js frontend (lines 1880-1919)
 */

/**
 * Deep clone a value via JSON serialization
 */
export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Recursively update existing keys in obj with values from newObj
 * - Arrays: replaced with cloned array
 * - Dates: converted to new Date
 * - Strings: toString() conversion
 * - Objects: recursively updated
 * - Other types: cloned
 */
export function updateExistingObjectKeys(
  obj: Record<string, unknown>,
  newObj: Record<string, unknown>,
): void {
  Object.keys(obj).forEach((key) => {
    if (newObj[key]) {
      if (Array.isArray(obj[key]) && Array.isArray(newObj[key])) {
        obj[key] = clone(newObj[key]);
      } else if (obj[key] instanceof Date) {
        obj[key] = new Date(newObj[key] as string | number | Date);
      } else if (typeof obj[key] === 'string') {
        obj[key] = (newObj[key] || '').toString();
      } else if (typeof obj[key] === 'object' && obj[key]) {
        // If property is object, call the function recursively
        updateExistingObjectKeys(
          obj[key] as Record<string, unknown>,
          newObj[key] as Record<string, unknown>,
        );
      } else {
        obj[key] = clone(newObj[key]);
      }
    }
  });
}

/**
 * Extend existing keys in obj with values from newObj
 * - Arrays: concatenated
 * - Strings: concatenated with space
 * - Objects: recursively extended
 * - Throws error for unknown types
 */
export function extendExistingObjectKeys(
  obj: Record<string, unknown>,
  newObj: Record<string, unknown>,
): void {
  Object.keys(newObj).forEach((key) => {
    if (obj[key] === undefined) {
      return;
    }
    if (Array.isArray(obj[key]) && Array.isArray(newObj[key])) {
      obj[key] = (obj[key] as unknown[]).concat(newObj[key] as unknown[]);
    } else if (typeof obj[key] === 'string') {
      obj[key] = (obj[key] + ' ' + (newObj[key] || '')).trim();
    } else if (typeof obj[key] === 'object' && obj[key]) {
      // If property is object, call the function recursively
      extendExistingObjectKeys(
        obj[key] as Record<string, unknown>,
        newObj[key] as Record<string, unknown>,
      );
    } else {
      throw new Error('Unknown key type');
    }
  });
}
