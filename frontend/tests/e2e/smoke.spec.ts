import { expect, test } from '@playwright/test';
import { createBaseScenario } from './fixtures/scenarioFactory';
import { registerScenario } from './fixtures/registerHook';
import { WizardPage } from './pages/wizardPage';
import { TestDataClient } from './fixtures/testDataClient';

const CONTACT = {
  firstName: 'Mira',
  lastName: 'Schmidt',
  email: 'mira@example.com',
  phone: '+49 999 111111',
};

const ADDRESS = {
  street: 'Domstraße',
  houseNumber: '12b',
  zipCode: '93047',
  place: 'Regensburg',
  presentLocation: 'Geschenke hinter dem Gartentor',
};

test.describe('Smoke Flow', () => {
  test('loads intro and navigates to contact form', async ({ page }) => {
    const scenario = createBaseScenario();
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);

    await wizard.goto();
    await expect(page.getByTestId('qa-view-intro')).toBeVisible();
    await expect(page.getByTestId('qa-deadlines')).toContainText('Wichtige Termine');

    await wizard.startWizard();
    await wizard.contactStep().fill(CONTACT);
  });

  test('completes happy path up to timeslot selection basic smoke', async ({ page }) => {
    const scenario = createBaseScenario();
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    const client = new TestDataClient(page);

    await wizard.goto();
    await wizard.startWizard();
    await wizard.contactStep().fill(CONTACT);
    await wizard.contactStep().submit();
    await wizard.contactStep().expectVerificationViewVisible();

    const stateAfterContact = await client.getState();
    const bookingId = Object.keys(stateAfterContact.bookings).pop()!;
    await wizard.resume(bookingId);

    await wizard.jumpToStep('address');
    await wizard.addressStep().fill(ADDRESS);
    await wizard.addressStep().submit();

    await wizard.jumpToStep('time-slot');
    const slotId = scenario.timeSlots[0].documentId;
    await wizard.timeSlotStep().toggleSlot(slotId);
    await wizard.timeSlotStep().submit();
  });
});
