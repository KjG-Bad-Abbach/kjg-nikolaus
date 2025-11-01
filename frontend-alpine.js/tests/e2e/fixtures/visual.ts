import { expect, Page } from "@playwright/test";
import { mkdir } from "fs/promises";
import path from "path";

export const VISUAL_BASELINE_DATE = "2030-11-15T18:00:00.000Z";

const expectScreenshotOptions = {
  fullPage: true,
  animations: "disabled" as const,
  caret: "hide" as const,
  scale: "css" as const,
};

const diskScreenshotOptions = {
  fullPage: true,
  animations: "disabled" as const,
};

const screenshotsDir = path.resolve(process.cwd(), "../imgs/spec-03");

export const freezeDate = async (
  page: Page,
  isoDate = VISUAL_BASELINE_DATE,
) => {
  await page.addInitScript(
    ({ frozenIso }) => {
      const timestamp = Date.parse(frozenIso);
      const OriginalDate = Date;
      const startedAt = OriginalDate.now();

      class MockDate extends OriginalDate {
        constructor(...args: Array<unknown>) {
          if (args.length === 0) {
            super(timestamp + (OriginalDate.now() - startedAt));
          } else {
            super(...(args as []));
          }
        }

        static now() {
          return timestamp + (OriginalDate.now() - startedAt);
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

      MockDate.UTC = OriginalDate.UTC;
      MockDate.parse = OriginalDate.parse;

      globalThis.Date = MockDate as DateConstructor;
    },
    { frozenIso: isoDate },
  );
};

export const blurActiveElement = async (page: Page) => {
  await page.evaluate(() => {
    const active = document.activeElement as HTMLElement | null;
    if (active && typeof active.blur === "function") {
      active.blur();
    }
  });
};

export const scrollToTop = async (page: Page) => {
  await page.evaluate(() => window.scrollTo({ top: 0, left: 0 }));
};

const prepareForScreenshot = async (page: Page, preserveFocus: boolean) => {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(150);
  if (!preserveFocus) {
    await blurActiveElement(page);
  }
  await scrollToTop(page);
};

type CaptureOptions = {
  storeOnDisk?: boolean;
  directory?: string;
  preserveFocus?: boolean;
};

export const captureScreenshot = async (
  page: Page,
  fileName: string,
  options: CaptureOptions = {},
) => {
  const {
    storeOnDisk = false,
    directory = screenshotsDir,
    preserveFocus = false,
  } = options;
  await prepareForScreenshot(page, preserveFocus);
  await expect(page).toHaveScreenshot(fileName, expectScreenshotOptions);
  if (storeOnDisk) {
    await mkdir(directory, { recursive: true });
    await page.screenshot({
      path: path.join(directory, fileName),
      ...diskScreenshotOptions,
    });
  }
};
