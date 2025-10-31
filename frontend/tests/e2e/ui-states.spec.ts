import { expect, test } from "@playwright/test";
import {
  createBaseScenario,
  createReadOnlyScenario,
  createResumeScenario,
  withFailures,
} from "./fixtures/scenarioFactory";
import { registerScenario } from "./fixtures/registerHook";
import { recordScenarioCoverage } from "./fixtures/scenarioCoverage";
import { WizardPage } from "./pages/wizardPage";

test.describe("UI States & Edge Cases", () => {
  test("shows loading spinner and skips intro when introduction text missing", async ({
    page,
  }) => {
    const scenario = createBaseScenario();
    scenario.config.introduction_text = [];
    await registerScenario(page, scenario);
    await page.addInitScript(() => {
      const hookName = "__bookingTestApi";
      const applyDelay = (hook) => {
        if (
          !hook ||
          typeof hook.handleRequest !== "function" ||
          hook.__delayedConfig
        ) {
          return;
        }
        const original = hook.handleRequest.bind(hook);
        hook.handleRequest = async (request) => {
          if (request.url.startsWith("config")) {
            await new Promise((resolve) => setTimeout(resolve, 250));
          }
          return original(request);
        };
        hook.__delayedConfig = true;
      };

      const existing = window?.[hookName];
      if (existing) {
        applyDelay(existing);
        return;
      }

      Object.defineProperty(window, hookName, {
        configurable: true,
        set(value) {
          Object.defineProperty(window, hookName, {
            configurable: true,
            enumerable: false,
            writable: true,
            value,
          });
          applyDelay(value);
        },
        get() {
          return undefined;
        },
      });
    });
    const wizard = new WizardPage(page);
    recordScenarioCoverage("intro");

    await wizard.goto();
    await expect(page.getByTestId("qa-loading")).toBeVisible();
    await expect(page.getByTestId("qa-loading")).toBeHidden();
    await expect(page.getByTestId("qa-view-intro")).toBeHidden();
    await expect(page.getByTestId("qa-view-steps")).toBeVisible();
  });

  test("prevents jumping to later steps before booking is created", async ({
    page,
  }) => {
    const scenario = createBaseScenario();
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    recordScenarioCoverage("resume");

    await wizard.goto();
    await wizard.startWizard();

    await page.getByTestId("qa-step-address").click();

    await expect(page.getByTestId("qa-contact-form")).toBeVisible();
    await expect(page.getByTestId("qa-address-form")).toBeHidden();
  });

  test("prompts about unsaved changes when navigating steps in resume flow", async ({
    page,
  }) => {
    const scenario = createResumeScenario();
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    recordScenarioCoverage("resume");

    await wizard.goto("?id=booking-existing");
    await wizard.jumpToStep("contact");
    await page.getByTestId("qa-contact-phone").fill("+49 111 222222");

    page.removeAllListeners("dialog");
    await page.once("dialog", async (dialog) => {
      await dialog.dismiss();
    });
    await page.getByTestId("qa-step-address").click();
    await expect(page.getByTestId("qa-contact-form")).toBeVisible();

    page.removeAllListeners("dialog");
    await page.once("dialog", async (dialog) => {
      await dialog.accept();
    });
    await page.getByTestId("qa-step-address").click();
    await expect(page.getByTestId("qa-address-form")).toBeVisible();

    page.on("dialog", (dialog) => dialog.accept());
  });

  test("renders deadline banners with strikethrough and locks editing after expiry", async ({
    page,
  }) => {
    const scenario = createReadOnlyScenario();
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    recordScenarioCoverage("readOnly", "addressDeadline");

    await wizard.goto("?id=booking-existing");

    await expect(page.getByTestId("qa-deadline-route-planning")).toHaveClass(
      /line-through/,
    );
    await expect(page.getByTestId("qa-deadline-final")).toHaveClass(
      /line-through/,
    );

    await wizard.jumpToStep("address");
    await expect(page.getByTestId("qa-address-street")).not.toBeEditable();
    await wizard.jumpToStep("children");
    await expect(page.getByTestId("qa-child-name-0")).not.toBeEditable();
    await expect(page.getByTestId("qa-additional-notes")).not.toBeEditable();
  });

  test("allows removing selected time slots and warns when below max selection", async ({
    page,
  }) => {
    const scenario = createResumeScenario();
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    recordScenarioCoverage("timeSlot");

    await wizard.goto("?id=booking-existing");
    await wizard.jumpToStep("time-slot");

    const slotToAdd = scenario.timeSlots[1].documentId;
    await wizard.timeSlotStep().toggleSlot(slotToAdd);
    await wizard.timeSlotStep().expectSelected(slotToAdd);

    const existingSlot = scenario.timeSlots[0].documentId;
    await wizard.timeSlotStep().removeSelected(existingSlot);
    await expect(
      page.getByTestId(`qa-selected-time-slot-${existingSlot}`),
    ).toBeHidden();

    await wizard.timeSlotStep().submit();
    await wizard.jumpToStep("time-slot");
    await expect(page.getByTestId("qa-time-slot-form")).toContainText(
      "Bitte wähle mindestens",
    );
  });

  test("hides time-slot search input when disabled in config", async ({
    page,
  }) => {
    const scenario = createResumeScenario();
    scenario.config.show_search_for_time_slots = false;
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    recordScenarioCoverage("timeSlot");

    await wizard.goto("?id=booking-existing");
    await wizard.jumpToStep("time-slot");

    await expect(page.getByTestId("qa-time-slot-search")).toBeHidden();
    await expect(page.getByTestId("qa-time-slot-form")).toBeVisible();
  });

  test("shows route-complete summary banner while other details are missing", async ({
    page,
  }) => {
    const scenario = createResumeScenario();
    const slotA = scenario.timeSlots[0].documentId;
    const slotB = scenario.timeSlots[1].documentId;
    const slotC = scenario.timeSlots[2].documentId;
    scenario.bookings[0].time_slots = [
      { documentId: slotA },
      { documentId: slotB },
      { documentId: slotC },
    ];
    scenario.bookings[0].children = [
      {
        name: "Mila",
        identification_trait: "6 Jahre, liebt Hunde",
        speech: "",
      },
    ];
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    recordScenarioCoverage("summary");

    await wizard.goto("?id=booking-existing");
    await wizard.jumpToStep("summary");

    await expect(page.getByTestId("qa-summary-route-complete")).toBeVisible();
    await expect(page.getByTestId("qa-summary-details-missing")).toBeVisible();
  });

  test("displays error modal details for failed time-slot fetch", async ({
    page,
  }) => {
    const scenario = withFailures(createResumeScenario(), [
      {
        stage: "time-slot-fetch",
        once: true,
        error: {
          message: "Slots unavailable",
          status: { code: 500, text: "Server Error" },
          body: { error: { code: "TIME_SLOT_FETCH_FAILED" } },
        },
      },
    ]);
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    recordScenarioCoverage("timeSlot", "errorModal");

    await wizard.goto("?id=booking-existing");

    await wizard.errorModal().expectVisible();
    const codeBlock = page.locator("code").first();
    const detailsToggle = page.getByTestId("qa-error-details-toggle");
    if (await detailsToggle.isVisible()) {
      await wizard.errorModal().openDetails();
      await expect(codeBlock).toContainText("TIME_SLOT_FETCH_FAILED");
    } else {
      await expect(detailsToggle).toBeHidden();
    }
    await wizard.errorModal().dismiss();
    await expect(page.getByTestId("qa-error-modal")).toBeHidden();

    const contactForm = page.getByTestId("qa-contact-form");
    await expect(contactForm).toBeVisible();
    await page.getByTestId("qa-step-time-slot").click();
    await expect(contactForm).toBeVisible();
  });

  test("handles resend verification failure with error modal controls", async ({
    page,
  }) => {
    const scenario = withFailures(createBaseScenario(), [
      {
        stage: "send-verification",
        once: true,
        error: {
          message: "E-Mail konnte nicht gesendet werden",
          status: { code: 500, text: "Server Error" },
          body: { error: { code: "SEND_FAIL" } },
        },
      },
    ]);
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    recordScenarioCoverage("contact", "errorModal");

    await wizard.goto();
    await wizard.startWizard();
    await wizard.contactStep().fill({
      firstName: "Jara",
      lastName: "Vogel",
      email: "jara@example.com",
      phone: "+49 160 1112223",
    });
    await wizard.contactStep().submit();
    await wizard.contactStep().expectVerificationViewVisible();

    await wizard.contactStep().resendVerification();
    await wizard.errorModal().expectVisible();
    await expect(page.getByTestId("qa-error-modal")).toContainText(
      "E-Mail konnte nicht gesendet werden",
    );
    const detailsToggle = page.getByTestId("qa-error-details-toggle");
    if (await detailsToggle.isVisible()) {
      await wizard.errorModal().openDetails();
      await expect(page.locator("code").first()).toContainText("SEND_FAIL");
    }
    await wizard.errorModal().dismiss();
    await expect(page.getByTestId("qa-email-verification")).toBeVisible();
  });

  test("toggles footer links based on config", async ({ page }) => {
    const withoutLinks = createBaseScenario();
    withoutLinks.config.legal_notice_link = null;
    withoutLinks.config.privacy_policy_link = null;
    await registerScenario(page, withoutLinks);
    const wizard = new WizardPage(page);

    await wizard.goto();
    await expect(page.locator("a", { hasText: "Impressum" })).toBeHidden();
    await expect(page.locator("a", { hasText: "Datenschutz" })).toBeHidden();

    const withLinks = createBaseScenario();
    await registerScenario(page, withLinks);
    await wizard.goto();
    await expect(page.locator("a", { hasText: "Impressum" })).toHaveAttribute(
      "href",
      withLinks.config.legal_notice_link!,
    );
    await expect(page.locator("a", { hasText: "Datenschutz" })).toHaveAttribute(
      "href",
      withLinks.config.privacy_policy_link!,
    );
  });
});
