import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import {
  createBaseScenario,
  createReadOnlyScenario,
  withFailures,
} from "./fixtures/scenarioFactory";
import { registerScenario } from "./fixtures/registerHook";
import { recordScenarioCoverage } from "./fixtures/scenarioCoverage";
import { captureScreenshot, freezeDate } from "./fixtures/visual";
import { WizardPage } from "./pages/wizardPage";
import { TestDataClient } from "./fixtures/testDataClient";
import {
  expectDeadlinesEditable,
  expectDeadlinesLocked,
} from "./utils/deadlineAssertions";

const CONTACT = {
  firstName: "Jonas",
  lastName: "Becker",
  email: "jonas@example.com",
  phone: "+49 151 2223334",
};

const ADDRESS = {
  street: "Kirchplatz",
  houseNumber: "9",
  zipCode: "93059",
  place: "Regensburg",
  presentLocation: "Pakete bitte beim Nachbarn Klingel 3",
};

const CHILD = {
  name: "Lara",
  identification: "8 Jahre, spielt Trompete",
  speech: "Lara freut sich auf den Nikolaus und hat ein Gedicht vorbereitet.",
};

test.describe("Screenshot gallery", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "Visual baselines tracked only for Chromium.",
  );

  test("captures happy path views", async ({ page }) => {
    const scenario = createBaseScenario();
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    const client = new TestDataClient(page);
    recordScenarioCoverage(
      "intro",
      "contact",
      "addressDeadline",
      "timeSlot",
      "children",
      "summary",
    );
    await freezeDate(page);

    await wizard.goto();
    await expect(page.getByTestId("qa-loading")).toBeHidden();
    await expect(
      page.getByTestId("qa-deadline-route-planning"),
    ).not.toHaveClass(/line-through/);
    await expect(page.getByTestId("qa-deadline-final")).not.toHaveClass(
      /line-through/,
    );
    await expectDeadlinesEditable(page);
    await captureScreenshot(page, "01-intro.png", { storeOnDisk: true });

    await wizard.startWizard();
    await wizard.contactStep().fill(CONTACT);
    await expect(page.getByTestId("qa-contact-form")).toBeVisible();
    await captureScreenshot(page, "02-contact.png", { storeOnDisk: true });

    await wizard.contactStep().submit();
    await wizard.contactStep().expectVerificationViewVisible();
    await captureScreenshot(page, "03-email-verification.png", {
      storeOnDisk: true,
    });

    const stateAfterContact = await client.getState();
    const bookingId = Object.keys(stateAfterContact.bookings).pop();
    expect(bookingId).toBeTruthy();
    await wizard.resume(bookingId!);

    await wizard.jumpToStep("address");
    await wizard.addressStep().fill(ADDRESS);
    await captureScreenshot(page, "04-address.png", { storeOnDisk: true });
    await wizard.addressStep().submit();

    await wizard.jumpToStep("time-slot");
    const slotA = scenario.timeSlots[0].documentId;
    const slotB = scenario.timeSlots[1].documentId;
    const slotC = scenario.timeSlots[2].documentId;
    await wizard.timeSlotStep().toggleSlot(slotA);
    await wizard.timeSlotStep().toggleSlot(slotB);
    await wizard.timeSlotStep().toggleSlot(slotC);
    await wizard.timeSlotStep().expectSelected(slotA);
    await wizard.timeSlotStep().expectSelected(slotB);
    await wizard.timeSlotStep().expectSelected(slotC);
    await captureScreenshot(page, "05-time-slot.png", { storeOnDisk: true });
    await wizard.timeSlotStep().submit();

    await wizard.jumpToStep("children");
    await wizard.childrenStep().addChild();
    await wizard.childrenStep().fillChild({
      index: 0,
      name: CHILD.name,
      identification: CHILD.identification,
      speech: CHILD.speech,
    });
    await wizard.childrenStep().fillNotes("Bitte kurz klingeln, Hund schläft.");
    await captureScreenshot(page, "06-children.png", { storeOnDisk: true });
    await wizard.childrenStep().submit();

    await wizard.summaryPage().expectAllComplete();
    await captureScreenshot(page, "07-summary.png", { storeOnDisk: true });
  });

  test("captures read-only state", async ({ page }) => {
    const scenario = createReadOnlyScenario();
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    recordScenarioCoverage("readOnly");
    await freezeDate(page, "2030-12-10T18:00:00.000Z");

    await wizard.goto("?id=booking-existing");
    await expectDeadlinesLocked(page);
    const existingSlotId = scenario.bookings[0].time_slots[0].documentId;
    await page.getByTestId("qa-step-time-slot").click({ force: true });
    await expect(
      page.getByTestId(`qa-selected-time-slot-${existingSlotId}`),
    ).toBeVisible();
    await wizard.jumpToStep("address");
    await wizard.addressStep().expectReadonly();
    await page.getByTestId("qa-deadlines").scrollIntoViewIfNeeded();
    await captureScreenshot(page, "08-read-only.png", { storeOnDisk: true });
  });

  test("captures error modal state", async ({ page }) => {
    const scenario = withFailures(createBaseScenario(), [
      {
        stage: "config",
        once: true,
        error: {
          message: "Backend offline",
          status: { code: 503, text: "Service Unavailable" },
        },
      },
    ]);
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    recordScenarioCoverage("errorModal");
    await freezeDate(page);

    await wizard.goto();
    await wizard.errorModal().expectVisible();
    await captureScreenshot(page, "09-error-modal.png", { storeOnDisk: true });
  });
});
