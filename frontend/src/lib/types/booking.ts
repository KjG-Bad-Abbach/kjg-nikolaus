/**
 * TypeScript type definitions for the booking system
 * Migrated from Alpine.js frontend to Svelte
 */

import type { SvelteDate } from 'svelte/reactivity';

export interface ContactPerson {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

export interface Location {
  street: string;
  house_number: string;
  zip_code: string;
  place: string;
}

export interface Child {
  id?: string;
  name: string;
  identification_trait: string;
  speech: string;
}

export interface TimeSlot {
  id: string;
  documentId: string;
  start: string; // ISO 8601
  end: string; // ISO 8601
  label?: string;
  max_bookings?: number;
}

export interface Booking {
  id?: string;
  documentId?: string;
  contact_person: ContactPerson;
  location: Location;
  present_location: string;
  children: Child[];
  time_slots: TimeSlot[];
  additional_notes: string;
}

export interface RichTextNode {
  type?: string;
  text?: string;
  level?: number;
  format?: 'ordered' | 'unordered';
  indentLevel?: number;
  url?: string;
  children?: RichTextNode[];
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

export interface Config {
  id: string;
  documentId?: string;
  show_search_for_time_slots: boolean;
  max_time_slots: number;
  route_planning_deadline: SvelteDate;
  final_deadline: SvelteDate;
  introduction_text: RichTextNode[];
  privacy_policy_link: string | null;
  legal_notice_link: string | null;
  api_token?: string;
  base_url?: string;
  api_base_url?: string;
}

export interface Step {
  name: string;
  testId: string;
  anyFilled: boolean;
  allFilled: boolean;
}

export interface ValidationMessages {
  [key: string]: string;
}

export interface ApiError {
  message: string;
  status?: {
    code: number;
    text: string;
  };
  body?: {
    error?: {
      name?: string;
      details?: {
        errors?: Array<{
          path: string[];
          message: string;
        }>;
      };
    };
    message?: string;
    fileName?: string;
    lineNumber?: number;
    columnNumber?: number;
    cause?: unknown;
    stack?: string[];
  } & Record<string, unknown>;
}

// Re-export DerivedStores from stores for convenience in tests
export type { DerivedStores } from '$lib/stores/derivedStores.svelte';
