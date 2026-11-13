/**
 * Rich text styles and URL policy
 * Migrated from Alpine.js frontend (lines 1969-2109)
 * Shared configuration for rendering Strapi rich text blocks
 */

import { extendExistingObjectKeys, updateExistingObjectKeys } from './object';

export interface RichTextClasses {
  heading1?: string;
  heading2?: string;
  heading3?: string;
  heading4?: string;
  heading5?: string;
  heading6?: string;
  paragraph?: string;
  list?: string;
  orderedList?: string;
  orderedListLevels?: string[];
  unorderedList?: string;
  unorderedListLevels?: string[];
  listItem?: string;
  link?: string;
  code?: string;
  extend?: Partial<RichTextClasses>;
}

export function getRichTextClasses(
  customClasses: RichTextClasses,
): Required<Omit<RichTextClasses, 'extend'>> {
  const defaultClasses = {
    heading1: 'text-4xl font-bold mb-4',
    heading2: 'text-3xl font-bold mb-3',
    heading3: 'text-2xl font-bold mb-2',
    heading4: 'text-xl font-bold mb-1',
    heading5: 'text-lg font-bold mb-1',
    heading6: 'text-base font-bold mb-1',
    paragraph: 'mb-4',
    list: 'mb-4 ml-4 list-inside',
    orderedList: '',
    orderedListLevels: ['list-decimal', 'list-lower-alpha', 'list-lower-roman'],
    unorderedList: '',
    unorderedListLevels: ['list-disc', 'list-circle', 'list-square'],
    listItem: 'mb-1',
    link: 'text-blue-600 hover:underline',
    code: 'bg-gray-100 rounded-sm px-1 font-mono',
  };
  // Extend defaultClasses with provided classes (overwrites existing ones)
  updateExistingObjectKeys(
    defaultClasses as unknown as Record<string, unknown>,
    customClasses as unknown as Record<string, unknown>,
    true,
  );
  // Extend defaultClasses with provided classes (adds new ones)
  extendExistingObjectKeys(
    defaultClasses as unknown as Record<string, unknown>,
    (customClasses.extend || {}) as unknown as Record<string, unknown>,
  );
  return defaultClasses;
}

export function getSafeRichTextUrl(value: string | undefined): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const href = value.trim();
  try {
    // A fixed HTTP base validates relative links without depending on browser globals during SSR.
    const { protocol } = new URL(href, 'https://rich-text.invalid/');
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(protocol) ? href : undefined;
  } catch {
    return undefined;
  }
}
