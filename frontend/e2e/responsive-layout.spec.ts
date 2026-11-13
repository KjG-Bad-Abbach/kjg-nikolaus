import { expect, test } from '@playwright/test';
import { createResumeScenario } from './fixtures/scenarioFactory';
import { registerScenario } from './fixtures/registerHook';
import { freezeDate } from './fixtures/visual';
import { WizardPage } from './pages/wizardPage';

for (const width_px of [320, 375, 768, 1440]) {
  test(`booking remains usable by keyboard without horizontal overflow at ${width_px}px`, async ({
    page,
  }) => {
    // Arrange
    await page.setViewportSize({ width: width_px, height: 900 });
    const scenario = createResumeScenario();
    await registerScenario(page, scenario);
    await freezeDate(page);
    const wizard = new WizardPage(page);

    // Act
    await wizard.goto();
    await wizard.introStartButton().focus();
    await page.keyboard.press('Enter');
    await expect(wizard.contactStep().form()).toBeVisible();
    await wizard.resume(scenario.bookings[0].documentId);

    for (const step of ['contact', 'address', 'time-slot', 'children', 'summary']) {
      const button = page.getByTestId(`qa-step-${step}`).getByRole('button');
      await button.focus();
      await page.keyboard.press('Enter');

      // Assert
      await expect(button).toBeFocused();
      await expect(button).toHaveAccessibleName(/.+/);
      await expect(
        page.getByTestId(step === 'summary' ? 'qa-step-panel-summary' : `qa-${step}-form`),
      ).toBeVisible();
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
        .toBeLessThanOrEqual(width_px);
      const fields = page.locator('input:not([type="hidden"]), textarea');
      for (const field of await fields.all()) {
        if (await field.isVisible()) {
          await expect(field).toHaveAccessibleName(/.+/);
        }
      }
    }
  });
}
