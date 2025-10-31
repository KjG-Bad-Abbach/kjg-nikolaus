import { expect, test } from "@playwright/test";
import { createBaseScenario } from "./fixtures/scenarioFactory";
import { registerScenario } from "./fixtures/registerHook";
import { freezeDate } from "./fixtures/visual";
import { expectDeadlinesEditable } from "./utils/deadlineAssertions";

const FROZEN_ISO_DATE = "2024-12-05T17:30:00.000Z";
const HERO_TEST_ID = "qa-view-intro";

test.describe("Homepage Screenshot", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "Visual baseline is tracked only for Chromium.",
  );

  test("homepage-smoke @screenshot", async ({ page }) => {
    const scenario = createBaseScenario();
    await registerScenario(page, scenario);
    await freezeDate(page, FROZEN_ISO_DATE);

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expectDeadlinesEditable(page);
    await expect(page.getByTestId(HERO_TEST_ID)).toBeVisible();

    await expect(page).toHaveScreenshot("homepage-smoke.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});
