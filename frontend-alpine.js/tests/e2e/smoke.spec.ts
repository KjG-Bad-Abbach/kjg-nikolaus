import { expect, test } from "@playwright/test";
import { createBaseScenario } from "./fixtures/scenarioFactory";
import { registerScenario } from "./fixtures/registerHook";
import { recordScenarioCoverage } from "./fixtures/scenarioCoverage";
import { captureScreenshot, freezeDate } from "./fixtures/visual";
import { expectDeadlinesEditable } from "./utils/deadlineAssertions";
import { WizardPage } from "./pages/wizardPage";
import { TestDataClient } from "./fixtures/testDataClient";

const CONTACT = {
  firstName: "Mira",
  lastName: "Schmidt",
  email: "mira@example.com",
  phone: "+49 999 111111",
};

const ADDRESS = {
  street: "Domstraße",
  houseNumber: "12b",
  zipCode: "93047",
  place: "Regensburg",
  presentLocation: "Geschenke hinter dem Gartentor",
};

test.describe("Smoke Flow", () => {
  test("loads intro and navigates to contact form", async ({ page }) => {
    const scenario = createBaseScenario();
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    recordScenarioCoverage("intro");
    await freezeDate(page);

    await wizard.goto();
    await expectDeadlinesEditable(page);
    await expect(page.getByTestId("qa-view-intro")).toBeVisible();
    await expect(page.getByTestId("qa-deadlines")).toContainText(
      "Wichtige Termine",
    );
    await captureScreenshot(page, "smoke-intro.png");

    await wizard.startWizard();
    await wizard.contactStep().fill(CONTACT);
    await expectDeadlinesEditable(page);
    await captureScreenshot(page, "smoke-contact.png");
  });

  test("completes happy path up to timeslot selection basic smoke", async ({
    page,
  }) => {
    const scenario = createBaseScenario();
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    const client = new TestDataClient(page);
    recordScenarioCoverage("intro", "contact", "addressDeadline", "timeSlot");
    await freezeDate(page);

    await wizard.goto();
    await expectDeadlinesEditable(page);
    await wizard.startWizard();
    await wizard.contactStep().fill(CONTACT);
    await wizard.contactStep().submit();
    await wizard.contactStep().expectVerificationViewVisible();
    await expectDeadlinesEditable(page);
    await captureScreenshot(page, "smoke-verification.png");

    const stateAfterContact = await client.getState();
    const bookingId = Object.keys(stateAfterContact.bookings).pop()!;
    await wizard.resume(bookingId);
    await expectDeadlinesEditable(page);

    await wizard.jumpToStep("address");
    await wizard.addressStep().fill(ADDRESS);
    await captureScreenshot(page, "smoke-address.png");
    await wizard.addressStep().submit();

    await wizard.jumpToStep("time-slot");
    const slotId = scenario.timeSlots[0].documentId;
    await wizard.timeSlotStep().toggleSlot(slotId);
    await captureScreenshot(page, "smoke-time-slot.png");
    await wizard.timeSlotStep().submit();
  });
});
