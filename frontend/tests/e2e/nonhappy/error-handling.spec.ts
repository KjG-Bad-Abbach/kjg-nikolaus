import { expect, test } from '@playwright/test';
import { createBaseScenario, withFailures } from '../fixtures/scenarioFactory';
import { registerScenario } from '../fixtures/registerHook';
import { recordScenarioCoverage } from '../fixtures/scenarioCoverage';
import { WizardPage } from '../pages/wizardPage';

test('recovers from initial config failure via retry', async ({ page }) => {
  const scenario = withFailures(createBaseScenario(), [
    {
      stage: 'config',
      once: true,
      error: {
        message: 'Backend offline',
        status: { code: 503, text: 'Service Unavailable' },
      },
    },
  ]);
  await registerScenario(page, scenario);
  const wizard = new WizardPage(page);
  recordScenarioCoverage('errorModal');

  await wizard.goto();
  await wizard.errorModal().expectVisible();
  await wizard.errorModal().retry();
  await expect(page.getByTestId('qa-view-intro')).toBeVisible();
});
