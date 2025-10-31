export interface ContactPerson {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

export interface LocationData {
  street: string;
  house_number: string;
  zip_code: string;
  place: string;
}

export interface ChildData {
  name: string;
  identification_trait?: string;
  speech?: string;
}

export interface BookingRecord {
  documentId: string;
  contact_person: ContactPerson;
  location: LocationData;
  present_location: string;
  children: ChildData[];
  time_slots: Array<{ documentId: string } | string>;
  additional_notes: string;
  email_resend_count?: number;
}

export interface ConfigBlockNode {
  type: string;
  children?: Array<{ text: string; bold?: boolean; italic?: boolean }>;
  text?: string;
}

export interface ConfigData {
  id: number;
  show_search_for_time_slots: boolean;
  max_time_slots: number;
  route_planning_deadline: string;
  final_deadline: string;
  introduction_text: ConfigBlockNode[];
  privacy_policy_link?: string;
  legal_notice_link?: string;
  api_token?: string;
  api_base_url?: string;
}

export interface TimeSlotRecord {
  documentId: string;
  start: string;
  end: string;
  max_bookings: number;
  max_reservations: number;
  available_reservations: number;
}

export type FailureStage =
  | 'config'
  | 'contact-save'
  | 'address-save'
  | 'time-slot-save'
  | 'children-save'
  | 'send-verification'
  | 'booking-fetch'
  | 'time-slot-fetch';

export interface ScenarioFailure {
  stage: FailureStage;
  once?: boolean;
  error: {
    message: string;
    status?: { code: number; text: string };
    body?: unknown;
  };
}

export interface BookingScenario {
  config: ConfigData;
  bookings: BookingRecord[];
  timeSlots: TimeSlotRecord[];
  nextBookingSeq?: number;
  failures?: ScenarioFailure[];
}
