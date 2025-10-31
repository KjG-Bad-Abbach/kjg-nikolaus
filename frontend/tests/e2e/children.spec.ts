import { expect, test } from "@playwright/test";
import {
  createBaseScenario,
  createEmptyChildrenBooking,
} from "./fixtures/scenarioFactory";
import { registerScenario } from "./fixtures/registerHook";
import { recordScenarioCoverage } from "./fixtures/scenarioCoverage";
import { WizardPage } from "./pages/wizardPage";
import { TestDataClient } from "./fixtures/testDataClient";

const CHILD = {
  index: 0,
  name: "Theo",
  identification: "7 Jahre, liebt Malen",
  speech: "Theo hilft seiner Schwester beim Lesen.",
};

const CHILD_TWO = {
  index: 1,
  name: "Nora",
  identification: "5 Jahre, fährt Laufrad",
  speech: "Nora räumt ihr Zimmer tapfer auf.",
};

test.describe("Children & Summary", () => {
  test("adds children, notes and removes entries", async ({ page }) => {
    const scenario = createBaseScenario();
    scenario.bookings.push(createEmptyChildrenBooking());
    scenario.nextBookingSeq = 2;
    await registerScenario(page, scenario);

    const wizard = new WizardPage(page);
    const client = new TestDataClient(page);
    recordScenarioCoverage("children");

    await wizard.goto("?id=booking-children");
    await wizard.jumpToStep("children");

    await wizard.childrenStep().addChild();
    await wizard.childrenStep().fillChild(CHILD);
    await wizard.childrenStep().addChild();
    await wizard.childrenStep().fillChild(CHILD_TWO);

    await wizard.childrenStep().removeChild(0);
    await wizard
      .childrenStep()
      .fillNotes("Bitte achtet auf den Hund im Garten.");
    await wizard.childrenStep().submit();

    await client.expectBookingField(
      "booking-children",
      (booking) => booking.children.length,
      (value) => expect(value).toBe(1),
    );
  });

  test("skip children navigates to summary and reflects missing data", async ({
    page,
  }) => {
    const scenario = createBaseScenario();
    scenario.bookings.push(createEmptyChildrenBooking());
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    recordScenarioCoverage("children", "summary");

    await wizard.goto("?id=booking-children");
    await wizard.jumpToStep("children");
    await wizard.childrenStep().skip();

    await expect(page.getByTestId("qa-step-panel-summary")).toBeVisible();
    await wizard.summaryPage().expectMissingRoute();
    await wizard.summaryPage().expectMissingDetails();
  });
});
