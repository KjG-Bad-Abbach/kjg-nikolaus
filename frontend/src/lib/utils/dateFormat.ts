/**
 * Date formatting utilities
 * Migrated from Alpine.js frontend (lines 1930-1967)
 * German locale date/time formatting with timezone awareness
 */

const currentYear = new Date().getFullYear();

/**
 * Format date as "Fr 5.12." or "Fr 5.12. 2025" if not current year
 * Example: "Fr 5.12." or "Sa 31.12. 2025"
 */
export function formatDate(date: Date): string {
  const day = date.toLocaleDateString('de-DE', {
    weekday: 'short',
  });
  const dateNum = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear() !== currentYear ? ` ${date.getFullYear()}` : '';
  return `${day} ${dateNum}.${month}.${year}`;
}

/**
 * Format time as "19:30"
 * Example: "19:30"
 */
export function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * Format date and time as "Fr 5.12. 19:30 Uhr"
 * Example: "Fr 5.12. 19:30 Uhr"
 */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)} Uhr`;
}

/**
 * Format date/time range as "Fr 5.12. 19:30 - 20:30 Uhr"
 * If dates differ, includes end date: "Fr 5.12. 19:30 - Sa 6.12. 20:30 Uhr"
 * Example: "Fr 5.12. 19:30 - 20:30 Uhr"
 */
export function formatDateTimeRange(start: Date, end: Date): string {
  const startStr = `${formatDate(start)} ${formatTime(start)}`;
  const endStr = formatTime(end);

  const endDateStr =
    start.getDate() !== end.getDate() ||
    start.getMonth() !== end.getMonth() ||
    start.getFullYear() !== end.getFullYear()
      ? `${formatDate(end)} `
      : '';

  return `${startStr} - ${endDateStr}${endStr} Uhr`;
}

/**
 * Format date for time slot grouping
 * Example: "Fr 5.12."
 */
export function formatTimeSlotGroup(date: Date): string {
  return formatDate(date);
}
