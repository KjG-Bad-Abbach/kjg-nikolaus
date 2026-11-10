import { expect, test as base, type Page } from '@playwright/test';
import {
  bookingDetails,
  HTTP_BOOKING_ID,
  HTTP_BOOKING_NUMERIC_ID,
  HTTP_TOKEN,
  startHttpBackend,
  type HttpBackend,
} from './fixtures/httpBackend';
import { createBaseScenario, createResumeScenario } from './fixtures/scenarioFactory';
import type { BookingScenario } from './fixtures/types';
import { freezeDate } from './fixtures/visual';
import { WizardPage } from './pages/wizardPage';

const test = base.extend<{
  httpBackend: (scenario: BookingScenario) => Promise<HttpBackend>;
}>({
  httpBackend: async ({ page, baseURL }, use, testInfo) => {
    const servers: HttpBackend[] = [];
    await use(async (scenario) => {
      const backend = await startHttpBackend(scenario, new URL(baseURL!).origin);
      servers.push(backend);
      await page.addInitScript(
        ({ baseUrl, token }) => {
          Object.assign(window, { API_BASE_URL: baseUrl, API_TOKEN: token });
        },
        { baseUrl: backend.baseUrl, token: HTTP_TOKEN },
      );
      await freezeDate(page);
      page.on('dialog', (dialog) => dialog.accept());
      return backend;
    });
    for (const backend of servers) {
      await backend.close();
      await testInfo.attach('http-contract-requests', {
        body: JSON.stringify(backend.requests, null, 2),
        contentType: 'application/json',
      });
      expect(backend.violations, 'Unexpected HTTP traffic').toEqual([]);
    }
  },
});

async function fillContact(wizard: WizardPage): Promise<void> {
  const contact = bookingDetails.contact_person;
  await wizard.startWizard();
  await wizard.contactStep().fill({
    firstName: contact.first_name,
    lastName: contact.last_name,
    email: contact.email,
    phone: contact.phone_number,
  });
}

async function expectNativeTransport(page: Page, backend: HttpBackend): Promise<void> {
  expect(await page.evaluate(() => '__bookingTestApi' in window)).toBe(false);
  expect(new URL(page.url()).origin).not.toBe(backend.baseUrl);
  expect(backend.requests.filter((request) => request.method === 'OPTIONS').length).toBeGreaterThan(
    0,
  );
  expect(backend.violations).toEqual([]);
}

test('persists a complete booking through cross-origin HTTP and a supplied booking link', async ({
  page,
  httpBackend,
}) => {
  // Arrange
  const scenario = createBaseScenario();
  const backend = await httpBackend(scenario);
  const wizard = new WizardPage(page);
  const slotIds = scenario.timeSlots
    .slice(0, scenario.config.max_time_slots)
    .map((slot) => slot.documentId);

  // Act
  await wizard.goto();
  await fillContact(wizard);
  await wizard.contactStep().submit();

  // Assert
  await wizard.contactStep().expectVerificationViewVisible();
  expect(backend.state.bookings[0].documentId).toBe(HTTP_BOOKING_ID);
  expect(HTTP_BOOKING_ID).not.toBe(String(HTTP_BOOKING_NUMERIC_ID));
  expect(backend.requests.find((request) => request.method === 'POST')?.body).toEqual({
    data: { contact_person: bookingDetails.contact_person },
  });
  await wizard.contactStep().resendVerification();
  await expect.poll(() => backend.verificationLinks).toHaveLength(1);
  expect(backend.verificationLinks[0]).toBe(`${new URL(page.url()).origin}/?id=${HTTP_BOOKING_ID}`);
  await page.goto(backend.verificationLinks[0]);
  await expect(page.getByTestId('qa-address-form')).toBeVisible();
  await wizard.addressStep().fill({
    street: bookingDetails.location.street,
    houseNumber: bookingDetails.location.house_number,
    zipCode: bookingDetails.location.zip_code,
    place: bookingDetails.location.place,
    presentLocation: bookingDetails.present_location,
  });
  await wizard.addressStep().submit();
  await expect(page.getByTestId('qa-time-slot-form')).toBeVisible();
  for (const slot of scenario.timeSlots) {
    await expect(page.getByTestId(`qa-time-slot-${slot.documentId}`)).toBeVisible();
  }
  for (const documentId of slotIds) await wizard.timeSlotStep().toggleSlot(documentId);
  await wizard.timeSlotStep().submit();
  await expect(page.getByTestId('qa-children-form')).toBeVisible();
  await wizard.childrenStep().addChild();
  const child = bookingDetails.children[0];
  await wizard.childrenStep().fillChild({
    index: 0,
    name: child.name,
    identification: child.identification_trait,
    speech: child.speech,
  });
  await wizard.childrenStep().fillNotes(bookingDetails.additional_notes);
  await wizard.childrenStep().submit();
  await wizard.summaryPage().expectAllComplete();
  await page.reload();
  await wizard.summaryPage().expectAllComplete();
  await expect(page.getByTestId('qa-step-panel-summary')).toBeVisible();

  const summary = page.getByTestId('qa-view-steps');
  for (const value of [
    bookingDetails.contact_person.email,
    bookingDetails.location.street,
    bookingDetails.present_location,
    child.name,
    child.identification_trait!,
    child.speech!,
    bookingDetails.additional_notes,
  ])
    await expect(summary).toContainText(value);
  expect(backend.state.bookings[0]).toEqual({
    ...bookingDetails,
    documentId: HTTP_BOOKING_ID,
    time_slots: slotIds,
    email_resend_count: 1,
  });
  expect(
    backend.requests.filter((request) => request.method === 'PUT').map((request) => request.body),
  ).toEqual([
    {
      data: {
        location: bookingDetails.location,
        present_location: bookingDetails.present_location,
      },
    },
    { data: { time_slots: slotIds } },
    {
      data: {
        children: bookingDetails.children,
        additional_notes: bookingDetails.additional_notes,
      },
    },
  ]);
  await wizard.jumpToStep('time-slot');
  for (const documentId of slotIds) await wizard.timeSlotStep().expectSelected(documentId);
  const inventoryRequests = backend.requests.filter(
    (request) => request.method === 'GET' && request.path === '/api/time-slots',
  );
  expect(inventoryRequests.length).toBeGreaterThan(0);
  for (const request of inventoryRequests) expect(request.query).not.toContain('filters');
  await expectNativeTransport(page, backend);
});

test('renders every repeated-path validation message in response order', async ({
  page,
  httpBackend,
}) => {
  // Arrange
  const scenario = createResumeScenario();
  const zipMessages = ['must be at least 5 characters', 'must contain only digits'];
  scenario.failures = [
    {
      stage: 'address-save',
      error: {
        message: 'Validation failed',
        status: { code: 400, text: 'Bad Request' },
        body: {
          error: {
            details: {
              errors: [
                { path: ['location', 'zip_code'], message: zipMessages[0] },
                { path: ['location', 'street'], message: 'Invalid street' },
                { path: ['location', 'zip_code'], message: zipMessages[1] },
              ],
            },
          },
        },
      },
    },
  ];
  const backend = await httpBackend(scenario);
  const wizard = new WizardPage(page);
  // Act
  await wizard.resume(scenario.bookings[0].documentId);
  await wizard.jumpToStep('address');
  await wizard.addressStep().submit();
  await wizard.errorModal().expectVisible();
  await wizard.errorModal().dismiss();
  // Assert
  const zipErrors = page.getByTestId('qa-address-zip').locator('..').locator('div');
  await expect(zipErrors).toHaveText(zipMessages);
  await expect(zipErrors.nth(0)).toBeVisible();
  await expect(zipErrors.nth(1)).toBeVisible();
  await expect(page.getByTestId('qa-address-street').locator('..').locator('div')).toHaveText(
    'Invalid street',
  );
  await expectNativeTransport(page, backend);
});

for (const stage of ['config', 'contact-save', 'send-verification'] as const) {
  test(`recovers from a rejected ${stage} HTTP request without losing its view`, async ({
    page,
    httpBackend,
  }) => {
    // Arrange
    const scenario = createBaseScenario();
    scenario.failures = [
      {
        stage,
        once: true,
        error: {
          message: 'Contract request rejected',
          status: { code: 503, text: 'Service Unavailable' },
          body: {
            error: { name: 'ServiceUnavailableError', message: 'Contract request rejected' },
          },
        },
      },
    ];
    const backend = await httpBackend(scenario);
    const wizard = new WizardPage(page);

    // Act
    await wizard.goto();
    if (stage !== 'config') {
      await fillContact(wizard);
      await wizard.contactStep().submit();
      if (stage === 'send-verification') {
        await wizard.contactStep().expectVerificationViewVisible();
        await wizard.contactStep().resendVerification();
      }
    }

    // Assert
    await wizard.errorModal().expectVisible();
    expect(backend.requests.filter((request) => request.status === 503)).toHaveLength(1);
    if (stage === 'config') {
      await wizard.errorModal().retry();
      await expect(page.getByTestId('qa-view-intro')).toBeVisible();
      await expect
        .poll(() =>
          backend.requests
            .filter((request) => request.method === 'GET' && request.path === '/api/config')
            .map((request) => request.status),
        )
        .toEqual([503, 200]);
      await expect(page.getByTestId('qa-error-modal')).toBeHidden();
      await fillContact(wizard);
    } else {
      expect(backend.state.bookings).toHaveLength(stage === 'contact-save' ? 0 : 1);
      await wizard.errorModal().dismiss();
      if (stage === 'contact-save') {
        await expect(page.getByTestId('qa-contact-form')).toBeVisible();
        await expect(page.getByTestId('qa-contact-email')).toHaveValue(
          bookingDetails.contact_person.email,
        );
        await expect(page.getByTestId('qa-email-verification')).toBeHidden();
        await wizard.contactStep().submit();
        await wizard.contactStep().expectVerificationViewVisible();
        expect(backend.state.bookings).toHaveLength(1);
      } else {
        await wizard.contactStep().expectVerificationViewVisible();
        expect(backend.verificationLinks).toEqual([]);
        await wizard.contactStep().resendVerification();
        await expect.poll(() => backend.verificationLinks).toHaveLength(1);
        await expect(page.getByTestId('qa-error-modal')).toBeHidden();
      }
    }
    await expectNativeTransport(page, backend);
  });
}

test('dismissal of a concurrency 409 reloads backend-cleaned document selections', async ({
  page,
  httpBackend,
}) => {
  // Arrange
  const scenario = createResumeScenario();
  const documentId = scenario.bookings[0].documentId;
  const keptSlot = scenario.timeSlots[0].documentId;
  const rejectedSlot = scenario.timeSlots[1].documentId;
  scenario.bookings[0].time_slots = [{ documentId: keptSlot }, { documentId: rejectedSlot }];
  const cleanedBooking = structuredClone(scenario.bookings[0]);
  cleanedBooking.time_slots = [{ documentId: keptSlot }];
  scenario.failures = [
    {
      stage: 'time-slot-save',
      once: true,
      error: {
        message: 'Slot conflict',
        status: { code: 409, text: 'Conflict' },
        body: {
          data: null,
          error: {
            status: 409,
            name: 'ConflictError',
            message: 'Slot conflict',
            details: { data: cleanedBooking, meta: { concurrencyTimeSlotsError: true } },
          },
        },
      },
    },
  ];
  const backend = await httpBackend(scenario);
  const wizard = new WizardPage(page);

  // Act
  await wizard.resume(documentId);
  await wizard.jumpToStep('time-slot');
  await wizard.timeSlotStep().expectSelected(keptSlot);
  await wizard.timeSlotStep().expectSelected(rejectedSlot);
  await wizard.timeSlotStep().submit();

  // Assert
  await wizard.errorModal().expectVisible();
  // Original Alpine concurrency recovery instruction, independent of production copy.
  await expect(page.getByTestId('qa-error-modal')).toContainText(
    'Bitte wähle noch andere Zeitslots aus.',
  );
  expect(backend.requests.find((request) => request.status === 409)?.body).toEqual({
    data: { time_slots: [keptSlot, rejectedSlot] },
  });
  expect(backend.state.bookings[0].time_slots).toEqual(cleanedBooking.time_slots);
  const readsBeforeDismiss = backend.requests.filter(
    (request) => request.method === 'GET' && request.path === `/api/bookings/${documentId}`,
  ).length;
  await wizard.errorModal().dismiss();
  await expect
    .poll(
      () =>
        backend.requests.filter(
          (request) => request.method === 'GET' && request.path === `/api/bookings/${documentId}`,
        ).length,
    )
    .toBeGreaterThan(readsBeforeDismiss);
  await expect(page.getByTestId('qa-error-modal')).toBeHidden();
  await wizard.timeSlotStep().expectSelected(keptSlot);
  await expect(page.getByTestId(`qa-selected-time-slot-${rejectedSlot}`)).toBeHidden();
  await page.reload();
  await wizard.jumpToStep('time-slot');
  await wizard.timeSlotStep().expectSelected(keptSlot);
  await expect(page.getByTestId(`qa-selected-time-slot-${rejectedSlot}`)).toBeHidden();
  await expectNativeTransport(page, backend);
});
