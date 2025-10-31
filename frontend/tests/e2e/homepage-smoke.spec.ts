import { expect, test } from "@playwright/test";
import { createBaseScenario } from "./fixtures/scenarioFactory";
import { registerScenario } from "./fixtures/registerHook";

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

    await page.addInitScript(
      ({ isoDate }) => {
        const timestamp = Date.parse(isoDate);
        const OriginalDate = Date;

        class MockDate extends OriginalDate {
          constructor(...args: Array<unknown>) {
            if (args.length === 0) {
              super(timestamp);
            } else {
              super(...(args as []));
            }
          }

          static now() {
            return timestamp;
          }
        }

        Object.getOwnPropertyNames(OriginalDate).forEach((prop) => {
          if (!(prop in MockDate)) {
            const descriptor = Object.getOwnPropertyDescriptor(
              OriginalDate,
              prop,
            );
            if (descriptor) {
              Object.defineProperty(MockDate, prop, descriptor);
            }
          }
        });

        // Ensure built-in static helpers remain available.
        MockDate.UTC = OriginalDate.UTC;
        MockDate.parse = OriginalDate.parse;

        globalThis.Date = MockDate as DateConstructor;
      },
      { isoDate: FROZEN_ISO_DATE },
    );

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId(HERO_TEST_ID)).toBeVisible();

    await expect(page).toHaveScreenshot("homepage-smoke.png", {
      fullPage: true,
      animations: "disabled",
    });
  });
});
