import { BookingRecord, BookingScenario, ChildData, ConfigData, ContactPerson, LocationData, ScenarioFailure, TimeSlotRecord } from './types';

const BASE_ROUTE_DEADLINE = '2030-11-20T22:00:00.000Z';
const BASE_FINAL_DEADLINE = '2030-12-01T22:00:00.000Z';

const defaultConfig = (): ConfigData => ({
  id: 1,
  show_search_for_time_slots: true,
  max_time_slots: 2,
  route_planning_deadline: BASE_ROUTE_DEADLINE,
  final_deadline: BASE_FINAL_DEADLINE,
  introduction_text: [
    {
      type: 'paragraph',
      children: [
        {
          text: 'Automatisierte Testsicherung für den Nikolaus-Buchungsassistenten.',
        },
      ],
    },
  ],
  privacy_policy_link: 'https://example.com/datenschutz',
  legal_notice_link: 'https://example.com/impressum',
});

const defaultContact = (): ContactPerson => ({
  first_name: 'Ada',
  last_name: 'Lovelace',
  email: 'ada@example.com',
  phone_number: '+49 123 456789',
});

const defaultLocation = (): LocationData => ({
  street: 'Hauptstraße',
  house_number: '1a',
  zip_code: '93077',
  place: 'Bad Abbach',
});

const defaultChildren = (): ChildData[] => [
  {
    name: 'Mila',
    identification_trait: '6 Jahre, liebt Hunde',
    speech: 'Mila hilft gerne beim Aufräumen.',
  },
];

const defaultTimeSlots = (): TimeSlotRecord[] => {
  const base = new Date('2030-12-05T16:00:00.000Z');
  return Array.from({ length: 4 }).map((_, idx) => {
    const start = new Date(base.getTime() + idx * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 45 * 60 * 1000);
    return {
      documentId: `slot-${idx + 1}`,
      start: start.toISOString(),
      end: end.toISOString(),
      max_bookings: 3,
      max_reservations: 3,
      available_reservations: 3,
    } satisfies TimeSlotRecord;
  });
};

export const createBaseScenario = (): BookingScenario => ({
  config: defaultConfig(),
  bookings: [],
  timeSlots: defaultTimeSlots(),
  nextBookingSeq: 1,
  failures: [],
});

export const createResumeScenario = (): BookingScenario => {
  const scenario = createBaseScenario();
  const existing: BookingRecord = {
    documentId: 'booking-existing',
    contact_person: defaultContact(),
    location: defaultLocation(),
    present_location: 'Geschenke hinter der Garage',
    children: defaultChildren(),
    time_slots: [{ documentId: scenario.timeSlots[0].documentId }],
    additional_notes: 'Bitte leise klingeln.',
    email_resend_count: 0,
  };
  scenario.bookings.push(existing);
  scenario.nextBookingSeq = 2;
  return scenario;
};

export const createReadOnlyScenario = (): BookingScenario => {
  const scenario = createResumeScenario();
  scenario.config.route_planning_deadline = '2020-11-20T22:00:00.000Z';
  scenario.config.final_deadline = '2020-11-25T22:00:00.000Z';
  return scenario;
};

export const cloneScenario = (scenario: BookingScenario): BookingScenario =>
  JSON.parse(JSON.stringify(scenario));

export const withFailures = (
  scenario: BookingScenario,
  failures: ScenarioFailure[],
): BookingScenario => {
  const clone = cloneScenario(scenario);
  clone.failures = [...(clone.failures || []), ...failures];
  return clone;
};

export const createEmptyChildrenBooking = (): BookingRecord => ({
  documentId: 'booking-children',
  contact_person: defaultContact(),
  location: defaultLocation(),
  present_location: 'Carport',
  children: [],
  time_slots: [],
  additional_notes: '',
  email_resend_count: 0,
});
