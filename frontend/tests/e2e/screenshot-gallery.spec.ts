import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mkdir } from 'fs/promises';
import path from 'path';
import { createBaseScenario, createReadOnlyScenario, withFailures } from './fixtures/scenarioFactory';
import { registerScenario } from './fixtures/registerHook';
import { recordScenarioCoverage } from './fixtures/scenarioCoverage';
import { WizardPage } from './pages/wizardPage';
import { TestDataClient } from './fixtures/testDataClient';

const CONTACT = {
  firstName: 'Jonas',
  lastName: 'Becker',
  email: 'jonas@example.com',
  phone: '+49 151 2223334',
};

const ADDRESS = {
  street: 'Kirchplatz',
  houseNumber: '9',
  zipCode: '93059',
  place: 'Regensburg',
  presentLocation: 'Pakete bitte beim Nachbarn Klingel 3',
};

const CHILD = {
  name: 'Lara',
  identification: '8 Jahre, spielt Trompete',
  speech: 'Lara freut sich auf den Nikolaus und hat ein Gedicht vorbereitet.',
};

const screenshotsDir = path.resolve(process.cwd(), '../imgs/spec-03');

async function ensureScreenshotsDir() {
  await mkdir(screenshotsDir, { recursive: true });
}

async function capture(page: Page, fileName: string) {
  await page.waitForTimeout(250);
  await page.screenshot({
    path: path.join(screenshotsDir, fileName),
    fullPage: true,
  });
}

test.describe('Screenshot gallery', () => {
  test.beforeAll(async () => {
    await ensureScreenshotsDir();
  });

  test('captures happy path views', async ({ page }) => {
    const scenario = createBaseScenario();
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    const client = new TestDataClient(page);
    recordScenarioCoverage('intro', 'contact', 'addressDeadline', 'timeSlot', 'children', 'summary');

    await wizard.goto();
    await capture(page, '01-intro.png');

    await wizard.startWizard();
    await wizard.contactStep().fill(CONTACT);
    await expect(page.getByTestId('qa-contact-form')).toBeVisible();
    await capture(page, '02-contact.png');

    await wizard.contactStep().submit();
    await wizard.contactStep().expectVerificationViewVisible();
    await capture(page, '03-email-verification.png');

    const stateAfterContact = await client.getState();
    const bookingId = Object.keys(stateAfterContact.bookings).pop();
    expect(bookingId).toBeTruthy();
    await wizard.resume(bookingId!);

    await wizard.jumpToStep('address');
    await wizard.addressStep().fill(ADDRESS);
    await capture(page, '04-address.png');
    await wizard.addressStep().submit();

    await wizard.jumpToStep('time-slot');
    const slotA = scenario.timeSlots[0].documentId;
    const slotB = scenario.timeSlots[1].documentId;
    const slotC = scenario.timeSlots[2].documentId;
    await wizard.timeSlotStep().toggleSlot(slotA);
    await wizard.timeSlotStep().toggleSlot(slotB);
    await wizard.timeSlotStep().toggleSlot(slotC);
    await wizard.timeSlotStep().expectSelected(slotA);
    await wizard.timeSlotStep().expectSelected(slotB);
    await wizard.timeSlotStep().expectSelected(slotC);
    await capture(page, '05-time-slot.png');
    await wizard.timeSlotStep().submit();

    await wizard.jumpToStep('children');
    await wizard.childrenStep().addChild();
    await wizard.childrenStep().fillChild({
      index: 0,
      name: CHILD.name,
      identification: CHILD.identification,
      speech: CHILD.speech,
    });
    await wizard.childrenStep().fillNotes('Bitte kurz klingeln, Hund schläft.');
    await capture(page, '06-children.png');
    await wizard.childrenStep().submit();

    await wizard.summaryPage().expectAllComplete();
    await capture(page, '07-summary.png');
  });

  test('captures read-only state', async ({ page }) => {
    const scenario = createReadOnlyScenario();
    await registerScenario(page, scenario);
    const wizard = new WizardPage(page);
    recordScenarioCoverage('readOnly');

    await wizard.goto('?id=booking-existing');
    await wizard.jumpToStep('address');
    await wizard.addressStep().expectReadonly();
    await page.getByTestId('qa-deadlines').scrollIntoViewIfNeeded();
    await capture(page, '08-read-only.png');
  });

  test('captures error modal state', async ({ page }) => {
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
    await capture(page, '09-error-modal.png');
  });
});
