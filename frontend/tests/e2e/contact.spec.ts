import { expect, test } from "@playwright/test";
import { createBaseScenario } from "./fixtures/scenarioFactory";
import { registerScenario } from "./fixtures/registerHook";
import { recordScenarioCoverage } from "./fixtures/scenarioCoverage";
import { WizardPage } from "./pages/wizardPage";
import { TestDataClient } from "./fixtures/testDataClient";

const CONTACT = {
  firstName: "Felix",
  lastName: "Muster",
  email: "felix@example.com",
  phone: "+49 170 123456",
};

test.describe("Contact Step", () => {
  test("requires all mandatory fields", async ({ page }) => {
    const scenario = createBaseScenario();
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    const client = new TestDataClient(page);
    recordScenarioCoverage("contact");

    await wizard.goto();
    await wizard.startWizard();
    await wizard.contactStep().submit();

    await expect(page.getByTestId("qa-contact-first-name")).toBeFocused();
    const nativeMessage = await page
      .getByTestId("qa-contact-first-name")
      .evaluate((input: HTMLInputElement) => input.validationMessage);
    expect(nativeMessage.trim().length).toBeGreaterThan(0);

    const state = await client.getState();
    expect(Object.keys(state.bookings).length).toBe(0);
  });

  test("creates booking and triggers verification resend", async ({ page }) => {
    const scenario = createBaseScenario();
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    const client = new TestDataClient(page);
    recordScenarioCoverage("contact");

    await wizard.goto();
    await wizard.startWizard();
    await wizard.contactStep().fill(CONTACT);
    await wizard.contactStep().submit();

    await wizard.contactStep().expectVerificationViewVisible();

    const stateAfterCreate = await client.getState();
    const bookingIds = Object.keys(stateAfterCreate.bookings);
    expect(bookingIds.length).toBeGreaterThan(0);
    const bookingId = bookingIds.pop()!;
    expect(stateAfterCreate.bookings[bookingId].contact_person.email).toBe(
      CONTACT.email,
    );

    await wizard.contactStep().resendVerification();
    await client.expectBookingField(
      bookingId,
      (booking) => booking.email_resend_count,
      (value) => expect(value).toBeGreaterThan(0),
    );
  });
});
