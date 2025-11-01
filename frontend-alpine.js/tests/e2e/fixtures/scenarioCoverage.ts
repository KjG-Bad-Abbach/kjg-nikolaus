import { test, type TestInfo } from "@playwright/test";

type ScenarioDefinition = {
  title: string;
  testIds: string[];
};

export const scenarioCoverage = {
  intro: {
    title: "Intro + deadlines + start CTA",
    testIds: ["qa-view-intro", "qa-deadlines", "qa-intro-start", "qa-loading"],
  },
  contact: {
    title: "Contact validation + booking creation + resend",
    testIds: [
      "qa-contact-form",
      "qa-contact-first-name",
      "qa-contact-submit",
      "qa-email-verification",
      "qa-contact-resend",
    ],
  },
  resume: {
    title: "Resume flow gating + unsaved changes",
    testIds: [
      "qa-step-address",
      "qa-contact-phone",
      "qa-view-steps",
      "qa-stepper",
    ],
  },
  addressDeadline: {
    title: "Address edit + present location + deadline lock",
    testIds: [
      "qa-address-form",
      "qa-address-street",
      "qa-address-present-location",
      "qa-deadline-route-planning",
      "qa-deadline-final",
    ],
  },
  timeSlot: {
    title: "Time-slot search/select + capacity + conflict modal",
    testIds: [
      "qa-time-slot-form",
      "qa-time-slot-search",
      "qa-selected-time-slot-*",
      "qa-time-slot-*",
      "qa-error-modal",
    ],
  },
  children: {
    title: "Children add/remove/notes + skip path",
    testIds: [
      "qa-children-form",
      "qa-add-child",
      "qa-remove-child-*",
      "qa-child-name-*",
      "qa-additional-notes",
      "qa-children-skip",
    ],
  },
  summary: {
    title: "Summary completeness indicators",
    testIds: [
      "qa-step-panel-summary",
      "qa-summary-route-complete",
      "qa-summary-details-missing",
      "qa-summary-all-complete",
    ],
  },
  errorModal: {
    title: "Error modal retry/dismiss",
    testIds: [
      "qa-error-modal",
      "qa-error-retry",
      "qa-error-dismiss",
      "qa-error-details-toggle",
    ],
  },
  fullJourney: {
    title: "Full end-to-end happy path",
    testIds: [
      "qa-view-intro",
      "qa-contact-form",
      "qa-address-form",
      "qa-time-slot-form",
      "qa-children-form",
      "qa-step-panel-summary",
    ],
  },
  readOnly: {
    title: "Read-only resume (post final deadline)",
    testIds: [
      "qa-deadline-route-planning",
      "qa-deadline-final",
      "qa-address-street",
      "qa-child-name-*",
      "qa-additional-notes",
    ],
  },
} satisfies Record<string, ScenarioDefinition>;

export type ScenarioKey = keyof typeof scenarioCoverage;

const annotationType = "scenario";

const hasAnnotation = (info: TestInfo, key: ScenarioKey) =>
  info.annotations.some(
    (annotation) =>
      annotation.type === annotationType &&
      typeof annotation.description === "string" &&
      annotation.description.startsWith(`${key}:`),
  );

const annotateScenario = (info: TestInfo, key: ScenarioKey) => {
  if (hasAnnotation(info, key)) {
    return;
  }
  const definition = scenarioCoverage[key];
  const description = `${key}: ${definition.title} (${definition.testIds.join(", ")})`;
  info.annotations.push({
    type: annotationType,
    description,
  });
  info.attachments.push({
    name: `scenario:${key}`,
    contentType: "application/json",
    body: Buffer.from(JSON.stringify({ key, ...definition }, null, 2)),
  });
};

/** Records scenario coverage annotations for the current Playwright test. */
export const recordScenarioCoverage = (...keys: ScenarioKey[]) => {
  const info = test.info();
  keys.forEach((key) => annotateScenario(info, key));
};

/** Returns metadata for a specific scenario coverage key. */
export const getScenarioCoverage = (key: ScenarioKey) => scenarioCoverage[key];
