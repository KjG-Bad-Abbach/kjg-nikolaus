import { BookingRecord, BookingScenario, ChildData, ConfigBlockNode, ConfigData, ContactPerson, LocationData, ScenarioFailure, TimeSlotRecord } from './types';

const BASE_ROUTE_DEADLINE = '2030-11-20T22:00:00.000Z';
const BASE_FINAL_DEADLINE = '2030-12-01T22:00:00.000Z';

const introductionText: ConfigBlockNode[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Ho Ho Ho' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Auch dieses Jahr kommt der Nikolaus wieder! Am 5. und 6. Dezember 2024 jeweils ab 17:30 Uhr fliegen er und seine Engel zu euch nach Hause. Natürlich auf Spendenbasis. Alle Spenden fließen zu 100% in die Kinder- und Jugendarbeit der KjG Bad Abbach.',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'In der Adventszeit ist es Tradition, dass der heilige Nikolaus Kinder besucht und Lob und Tadel aus seinem goldenen Buch vorliest. Als KjG bieten wir diesen Nikolausdienst für Familien an. Der Nikolaus erhält im Vorfeld Informationen zu den Kindern, sodass das goldene Buch individuell gefüllt werden kann. Eine solche Information sollte den Namen, ein eindeutiges Identifikationsmerkmal sowie Lob und ggf. Tadel enthalten. Ebenso wird im Vorfeld mitgeteilt, wo sich die Geschenke befinden.',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Der Besuch dauert in etwa 10-20 Minuten. Bitte erwarte in dieser kurzen Zeit keine pädagogischen Wunder. Nutze die Gelegenheit deine Kinder zu loben und einen oder maximal zwei Verbesserungsimpulse zu geben. Unser Nikolaus hat immer einen Engel dabei, die Buchung eines Krampus oder Knecht Rupprecht ist nicht möglich.',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: "Wenn alle Informationen erfolgreich eingetragen wurden, dann steht einem erfolgreichen Nikolaus-Besuch nichts mehr im Wege und ihr bekommt im Schritt 'Kontrolle' eine entsprechende Meldung mit einem grünen Haken.",
      },
    ],
  },
];

const verificationEmailBodyTemplate: ConfigBlockNode[] = [
  {
    type: 'heading1',
    children: [{ text: 'E-Mail erfolgreich verifiziert!' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Hallo {{first_name}} {{last_name}},' }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'vielen Dank für die Verifizierung deiner E-Mail-Adresse. Du kannst jetzt deine Buchung vervollständigen, indem du alle erforderlichen Informationen eingibst.',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Nutze den untenstehenden Link, um deine Buchung jederzeit aufzurufen, zu überprüfen und zu bearbeiten:',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: "{{button('Buchung vervollständigen/bearbeiten')}}" }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Bitte stelle sicher, dass du alle erforderlichen Felder für eine erfolgreiche Buchung ausfüllst.',
      },
    ],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Deine KjG Bad Abbach.' }],
  },
];

const defaultConfig = (): ConfigData => ({
  id: 1,
  show_search_for_time_slots: true,
  max_time_slots: 3,
  route_planning_deadline: BASE_ROUTE_DEADLINE,
  final_deadline: BASE_FINAL_DEADLINE,
  base_url: 'http://localhost:4173',
  api_base_url: 'http://localhost:1337',
  introduction_text: introductionText,
  privacy_policy_link: 'https://kjg-bad-abbach.de/datenschutz/',
  legal_notice_link: 'https://kjg-bad-abbach.de/impressum/',
  api_token: 'sample-admin-token',
  verification_email_subject_template: 'E-Mail verifiziert - Vervollständige deine Buchung',
  verification_email_body_template: verificationEmailBodyTemplate,
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
