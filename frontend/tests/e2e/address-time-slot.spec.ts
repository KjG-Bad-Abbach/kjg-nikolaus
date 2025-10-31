import { expect, test } from "@playwright/test";
import {
  createReadOnlyScenario,
  createResumeScenario,
  withFailures,
} from "./fixtures/scenarioFactory";
import { registerScenario } from "./fixtures/registerHook";
import { recordScenarioCoverage } from "./fixtures/scenarioCoverage";
import { WizardPage } from "./pages/wizardPage";
import { TestDataClient } from "./fixtures/testDataClient";

const UPDATED_ADDRESS = {
  street: "Ringweg",
  houseNumber: "77",
  zipCode: "93059",
  place: "Regensburg",
  presentLocation: "Geschenke im Fahrradschuppen",
};

test.describe("Address & Time Slots", () => {
  test("updates address information for existing booking", async ({ page }) => {
    const scenario = createResumeScenario();
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    const client = new TestDataClient(page);
    recordScenarioCoverage("addressDeadline");

    await wizard.goto("?id=booking-existing");
    await wizard.jumpToStep("address");
    await wizard.addressStep().fill(UPDATED_ADDRESS);
    await wizard.addressStep().submit();

    await client.expectBookingField(
      "booking-existing",
      (booking) => booking.location.street,
      (value) => expect(value).toBe(UPDATED_ADDRESS.street),
    );
  });

  test("prevents edits when deadlines passed", async ({ page }) => {
    const scenario = createReadOnlyScenario();
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    recordScenarioCoverage("readOnly", "addressDeadline");

    await wizard.goto("?id=booking-existing");
    await wizard.jumpToStep("address");
    await wizard.addressStep().expectReadonly();
  });

  test("selects, searches and submits time slots", async ({ page }) => {
    const scenario = createResumeScenario();
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    const client = new TestDataClient(page);
    recordScenarioCoverage("timeSlot");

    await wizard.goto("?id=booking-existing");
    await wizard.jumpToStep("time-slot");

    const existingSlot = scenario.timeSlots[0].documentId;
    await wizard.timeSlotStep().toggleSlot(existingSlot);

    const primarySlot = scenario.timeSlots[1].documentId;
    const secondarySlot = scenario.timeSlots[2].documentId;
    await wizard.timeSlotStep().search("2030");
    await wizard.timeSlotStep().toggleSlot(primarySlot);
    await wizard.timeSlotStep().toggleSlot(secondarySlot);
    await wizard.timeSlotStep().expectSelected(primarySlot);
    await wizard.timeSlotStep().expectSelected(secondarySlot);

    // Re-select the original slot to reach the configured max slots (3)
    await wizard.timeSlotStep().toggleSlot(existingSlot);
    await wizard.timeSlotStep().expectSelected(existingSlot);

    const extraSlot = scenario.timeSlots[3].documentId;
    await expect(
      page
        .getByTestId(`qa-time-slot-${extraSlot}`)
        .locator('input[type="checkbox"]'),
    ).toBeDisabled();

    await wizard.timeSlotStep().submit();

    await client.expectBookingField(
      "booking-existing",
      (booking) =>
        booking.time_slots.map((slot) =>
          typeof slot === "string" ? slot : slot.documentId,
        ),
      (value) => expect(value).toContain(primarySlot),
    );
  });

  test("shows error modal on time slot conflict", async ({ page }) => {
    const scenario = withFailures(createResumeScenario(), [
      {
        stage: "time-slot-save",
        once: true,
        error: {
          message: "Slot conflict",
          status: { code: 409, text: "Conflict" },
          body: { error: { name: "ValidationError" } },
        },
      },
    ]);
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    recordScenarioCoverage("timeSlot", "errorModal");

    await wizard.goto("?id=booking-existing");
    await wizard.jumpToStep("time-slot");
    await wizard.timeSlotStep().toggleSlot(scenario.timeSlots[0].documentId);
    await wizard.timeSlotStep().submit();

    await wizard.errorModal().expectVisible();
  });
});
