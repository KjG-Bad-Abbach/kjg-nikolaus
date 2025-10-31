import { expect, test } from "@playwright/test";
import { createBaseScenario } from "../fixtures/scenarioFactory";
import { registerScenario } from "../fixtures/registerHook";
import { recordScenarioCoverage } from "../fixtures/scenarioCoverage";
import { captureScreenshot, freezeDate } from "../fixtures/visual";
import { expectDeadlinesEditable } from "../utils/deadlineAssertions";
import { WizardPage } from "../pages/wizardPage";
import { TestDataClient } from "../fixtures/testDataClient";

const CONTACT = {
  firstName: "Lina",
  lastName: "Kurz",
  email: "lina@example.com",
  phone: "+49 176 987654",
};

const ADDRESS = {
  street: "Parkweg",
  houseNumber: "3",
  zipCode: "93155",
  place: "Hemau",
  presentLocation: "Sack hinter der Haustür",
};

test.describe("Full Journey", () => {
  test("completes all steps and reaches fully green summary", async ({
    page,
  }) => {
    const scenario = createBaseScenario();
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    const client = new TestDataClient(page);
    recordScenarioCoverage(
      "fullJourney",
      "intro",
      "contact",
      "addressDeadline",
      "timeSlot",
      "children",
      "summary",
    );
    await freezeDate(page);

    await wizard.goto();
    await expectDeadlinesEditable(page);
    await wizard.startWizard();
    await wizard.contactStep().fill(CONTACT);
    await wizard.contactStep().submit();
    await wizard.contactStep().expectVerificationViewVisible();
    await expectDeadlinesEditable(page);

    const stateAfterContact = await client.getState();
    const bookingId = Object.keys(stateAfterContact.bookings).pop()!;

    await wizard.resume(bookingId);
    await expectDeadlinesEditable(page);

    await wizard.jumpToStep("address");
    await wizard.addressStep().fill(ADDRESS);
    await wizard.addressStep().submit();

    await wizard.jumpToStep("time-slot");
    const slotA = scenario.timeSlots[0].documentId;
    const slotB = scenario.timeSlots[1].documentId;
    const slotC = scenario.timeSlots[2].documentId;
    await wizard.timeSlotStep().toggleSlot(slotA);
    await wizard.timeSlotStep().toggleSlot(slotB);
    await wizard.timeSlotStep().toggleSlot(slotC);
    await wizard.timeSlotStep().submit();

    await wizard.jumpToStep("children");
    await wizard.childrenStep().addChild();
    await wizard.childrenStep().fillChild({
      index: 0,
      name: "Tom",
      identification: "9 Jahre, blaue Jacke",
      speech: "Tom hilft beim Tischdecken und übt Geduld.",
    });
    await wizard.childrenStep().fillNotes("Klingeln bitte nur kurz.");
    await wizard.childrenStep().submit();

    await expect(page.getByTestId("qa-step-panel-summary")).toBeVisible();
    await wizard.summaryPage().expectNoMissingNotices();
    await wizard.summaryPage().expectAllComplete();
    await captureScreenshot(page, "full-journey-summary.png");

    await client.expectBookingField(
      bookingId,
      (booking) => booking.children.length,
      (value) => expect(value).toBe(1),
    );
  });
});
