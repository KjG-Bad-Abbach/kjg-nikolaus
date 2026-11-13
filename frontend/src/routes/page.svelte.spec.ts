import { page } from 'vitest/browser';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { SvelteDate } from 'svelte/reactivity';
import { bookingStore, uiStore, optionsStore, validationStore, derivedStores } from '$lib/stores';
import { sendRequest } from '$lib/api/client';

// Mock the API client
vi.mock('$lib/api/client', () => ({
  sendRequest: vi.fn(),
}));

// Mock the unsaved changes utility
vi.mock('$lib/utils/unsavedChanges', () => ({
  registerCheckUnsavedChanges: vi.fn(),
}));

describe('/+page.svelte', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    bookingStore.reset();
    uiStore.reset();
    optionsStore.reset();
    validationStore.clearAll();
    // Mock API responses for config
    const { sendRequest } = await import('$lib/api/client');
    vi.mocked(sendRequest).mockResolvedValue({
      data: {
        id: '1',
        documentId: 'config-1',
        show_search_for_time_slots: false,
        max_time_slots: 3,
        route_planning_deadline: new SvelteDate('2099-12-01').toISOString(),
        final_deadline: new SvelteDate('2099-12-05').toISOString(),
        introduction_text: [],
        privacy_policy_link: null,
        legal_notice_link: null,
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should render main heading', async () => {
    render(Page);

    const heading = page.getByRole('heading', { level: 1 });
    await expect.element(heading).toBeInTheDocument();
    await expect.element(heading).toHaveTextContent('KjG Nikolaus Buchung');
  });

  it('should render app description', async () => {
    render(Page);

    await expect
      .element(page.getByText(/Buche deinen persönlichen Nikolausbesuch/))
      .toBeInTheDocument();
  });

  it('should initialize and render steps view when no intro text', async () => {
    render(Page);

    // Should show the booking root container
    const root = page.getByTestId('qa-booking-root');
    await expect.element(root).toBeInTheDocument();
  });

  it('should render deadline banner', async () => {
    render(Page);

    // Deadline banner should always be visible with both deadlines
    await expect.element(page.getByText(/Adresse und Zeitslots:/)).toBeInTheDocument();
    await expect.element(page.getByText(/Finale Deadline:/)).toBeInTheDocument();
  });

  it.each([0, 1, 2, 3, 4])(
    'Summaries_CurrentStep%s_Expect_AllPopulatedNoncurrentSections',
    async (step) => {
      // Arrange
      render(Page);
      await expect.element(page.getByTestId('qa-contact-form')).toBeVisible();
      uiStore.steps.forEach((_, index) => uiStore.updateStep(index, { anyFilled: true }));

      // Act
      uiStore.setStep(step);

      // Assert
      const headings = [
        'Kontaktinformationen',
        'Adresse und Ort für Geschenke',
        'Ausgewählte Zeitslots',
        'Kinder',
      ];
      for (const [index, name] of headings.entries()) {
        const heading = page.getByRole('heading', { level: 3, name, exact: true });
        if (step === index) {
          await expect.element(heading).not.toBeInTheDocument();
        } else {
          await expect.element(heading).toBeVisible();
        }
      }
      await expect.element(page.getByTestId('qa-view-steps')).toBeVisible();
    },
  );

  it('Summaries_FinalEmptyBooking_Expect_AllSectionsWithMissingWarnings', async () => {
    // Arrange
    render(Page);
    await expect.element(page.getByTestId('qa-contact-form')).toBeVisible();

    // Act
    uiStore.setStep(4);

    // Assert
    await expect.element(page.getByRole('heading', { level: 3 }).nth(3)).toBeVisible();
    expect(page.getByRole('heading', { level: 3 }).elements()).toHaveLength(4);
    await expect.element(page.getByText(/Angabe fehlt/).first()).toBeVisible();
  });

  it('SlotSummary_UnsavedSelection_Expect_CurrentInventoryLabelsInsteadOfSavedSlots', async () => {
    // Arrange
    render(Page);
    await expect.element(page.getByTestId('qa-contact-form')).toBeVisible();
    const savedSlot = {
      id: 'saved',
      documentId: 'saved-document',
      start: '2099-12-01T17:00:00Z',
      end: '2099-12-01T18:00:00Z',
      label: 'Saved slot',
    };
    const currentSlot = {
      ...savedSlot,
      id: 'current',
      documentId: 'current-document',
      label: 'Current slot',
    };
    bookingStore.updateFromDatabase({ time_slots: [savedSlot] });
    bookingStore.setAvailableTimeSlots([savedSlot, currentSlot]);
    uiStore.setStep(4);

    // Act
    bookingStore.setSelectedTimeSlotIds([currentSlot.documentId]);

    // Assert
    await expect.element(page.getByText('Current slot', { exact: true })).toBeVisible();
    await expect.element(page.getByText('Saved slot', { exact: true })).not.toBeInTheDocument();
  });

  it.each([
    ['Kontaktinformationen', 'qa-contact-form'],
    ['Adresse und Ort für Geschenke', 'qa-address-form'],
    ['Ausgewählte Zeitslots', 'qa-time-slot-form'],
    ['Kinder', 'qa-children-form'],
  ])('SummaryEdit_%s_Expect_MatchingForm', async (title, form) => {
    // Arrange
    render(Page);
    await expect.element(page.getByTestId('qa-contact-form')).toBeVisible();
    uiStore.setCanJumpToAnyStep(true);
    uiStore.setStep(4);
    vi.mocked(sendRequest).mockResolvedValue({ data: [] });

    // Act
    await page.getByRole('heading', { level: 3, name: title }).getByTitle('Bearbeiten').click();

    // Assert
    await expect.element(page.getByTestId(form)).toBeVisible();
  });

  it('SummaryEdit_DirtyBooking_Expect_CancelRetainsAndAcceptanceDiscardsWithoutSaving', async () => {
    // Arrange
    render(Page);
    await expect.element(page.getByTestId('qa-contact-form')).toBeVisible();
    bookingStore.updateFromDatabase({ present_location: 'Saved gift location' });
    bookingStore.updateField('present_location', 'Unsaved gift location');
    uiStore.setCanJumpToAnyStep(true);
    uiStore.setStep(4);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    vi.mocked(sendRequest).mockClear().mockResolvedValue({ data: [] });
    const editContact = page
      .getByRole('heading', { level: 3, name: 'Kontaktinformationen' })
      .getByTitle('Bearbeiten');

    // Act
    await editContact.click();

    // Assert
    expect(confirm).toHaveBeenCalledOnce();
    expect(uiStore.step).toBe(4);
    expect(bookingStore.booking.present_location).toBe('Unsaved gift location');
    expect(sendRequest).not.toHaveBeenCalled();

    // Act
    confirm.mockReturnValue(true);
    await editContact.click();

    // Assert
    await expect.element(page.getByTestId('qa-contact-form')).toBeVisible();
    expect(bookingStore.booking.present_location).toBe('Saved gift location');
    expect(sendRequest).toHaveBeenCalledExactlyOnceWith({ url: '/api/time-slots' });
  });

  it.each([
    [null, null],
    ['/legal', null],
    [null, '/privacy'],
    ['/legal', '/privacy'],
  ])('Footer_Links%s%s_Expect_OnlyConfiguredLinksAndSeparator', async (legal, privacy) => {
    // Arrange
    render(Page);
    await expect.element(page.getByTestId('qa-contact-form')).toBeVisible();

    // Act
    optionsStore.update({ legal_notice_link: legal, privacy_policy_link: privacy });

    // Assert
    const footer = page.getByRole('contentinfo');
    await expect.element(footer).toHaveTextContent(`© ${new Date().getFullYear()} KjG Bad Abbach`);
    await expect
      .element(footer)
      .toHaveTextContent('Alle Daten werden nach der Aktion vollständig gelöscht.');
    for (const [name, href] of [
      ['Impressum', legal],
      ['Datenschutz', privacy],
    ]) {
      const link = footer.getByRole('link', { name: name! });
      if (href) {
        await expect.element(link).toHaveAttribute('href', href);
      } else {
        await expect.element(link).not.toBeInTheDocument();
      }
    }
    if (legal && privacy) {
      await expect.element(footer.getByText('|', { exact: true })).toBeVisible();
    } else {
      await expect.element(footer.getByText('|', { exact: true })).not.toBeInTheDocument();
    }
  });

  it('Initialization_FailureThenRetry_Expect_ConfigReloadedAndFormRestored', async () => {
    // Arrange
    vi.mocked(sendRequest).mockRejectedValueOnce({ message: 'Configuration unavailable' });
    render(Page);
    await expect.element(page.getByTestId('qa-error-retry')).toBeVisible();

    // Act
    await page.getByTestId('qa-error-retry').click();

    // Assert
    expect(sendRequest).toHaveBeenCalledTimes(2);
    await expect.element(page.getByTestId('qa-error-modal')).not.toBeInTheDocument();
    await expect.element(page.getByTestId('qa-contact-form')).toBeVisible();
  });

  it('ErrorDismissal_Callback_Expect_RecoveryCallbackPreserved', async () => {
    // Arrange
    render(Page);
    await expect.element(page.getByTestId('qa-contact-form')).toBeVisible();
    const recover = vi.fn();
    uiStore.setError({ message: 'Recoverable error' }, false, recover);

    // Act
    await page.getByTestId('qa-error-dismiss').click();

    // Assert
    expect(recover).toHaveBeenCalledExactlyOnceWith();
    await expect.element(page.getByTestId('qa-error-modal')).not.toBeInTheDocument();
  });

  it('Deadlines_OpenPage_Expect_LiveRestrictionsAndClockCleanup', async () => {
    // Arrange
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    const initialTime_ms = Date.parse('2099-11-30T23:59:59Z');
    vi.setSystemTime(initialTime_ms);
    const clock = vi.spyOn(derivedStores, 'setCurrentTime');
    const { unmount } = await render(Page);
    await expect.element(page.getByTestId('qa-contact-form')).toBeVisible();
    optionsStore.update({
      route_planning_deadline: new SvelteDate(initialTime_ms + 1000),
      final_deadline: new SvelteDate(initialTime_ms + 2000),
    });
    expect(clock).toHaveBeenCalledWith(initialTime_ms);

    // Act
    await vi.advanceTimersByTimeAsync(1000);

    // Assert
    await expect
      .element(page.getByTestId('qa-deadline-route-planning'))
      .toHaveClass(/line-through/);
    await expect.element(page.getByTestId('qa-contact-first-name')).not.toHaveAttribute('readonly');

    // Act
    await vi.advanceTimersByTimeAsync(1000);

    // Assert
    await expect.element(page.getByTestId('qa-deadline-final')).toHaveClass(/line-through/);
    await expect.element(page.getByTestId('qa-contact-first-name')).toHaveAttribute('readonly');
    await expect.element(page.getByTestId('qa-contact-submit')).not.toBeInTheDocument();

    // Act
    await unmount();
    clock.mockClear();
    await vi.advanceTimersByTimeAsync(1000);

    // Assert
    expect(clock).not.toHaveBeenCalled();
  });

  it.each([
    {
      step: 1,
      field: 'qa-address-present-location',
      value: 'Behind the garage',
      submit: 'qa-address-submit',
      payload: { present_location: 'Behind the garage' },
    },
    {
      step: 3,
      field: 'qa-additional-notes',
      value: 'Please ring twice',
      submit: 'qa-children-submit',
      payload: { additional_notes: 'Please ring twice' },
    },
  ])('Submission_Step$stepApiFailure_Expect_CurrentPayloadWithoutAdvancement', async (scenario) => {
    // Arrange
    render(Page);
    await expect.element(page.getByTestId('qa-contact-form')).toBeVisible();
    uiStore.setBookingId('saved-booking');
    bookingStore.updateFromDatabase({
      location: {
        street: 'Main Street',
        house_number: '1',
        zip_code: '93077',
        place: 'Bad Abbach',
      },
      children: [{ name: 'Alex', identification_trait: 'Blue scarf', speech: 'Very helpful' }],
    });
    uiStore.setStep(scenario.step);
    const error = { message: 'Save failed' };
    vi.mocked(sendRequest).mockClear().mockRejectedValueOnce(error);

    // Act
    await page.getByTestId(scenario.field).fill(scenario.value);
    await page.getByTestId(scenario.submit).click();

    // Assert
    expect(sendRequest).toHaveBeenCalledExactlyOnceWith({
      url: '/api/bookings/saved-booking',
      method: 'PUT',
      body: { data: expect.objectContaining(scenario.payload) },
    });
    await expect.element(page.getByTestId('qa-error-modal')).toHaveTextContent(error.message);
    expect(uiStore.step).toBe(scenario.step);
    expect(uiStore.view).toBe('steps');
  });

  it('ChildrenSkip_UnsavedNotes_Expect_SharedDiscardNavigationWithoutSave', async () => {
    // Arrange
    render(Page);
    await expect.element(page.getByTestId('qa-contact-form')).toBeVisible();
    uiStore.setCanJumpToAnyStep(true);
    uiStore.setStep(3);
    await page.getByTestId('qa-additional-notes').fill('Unsaved note');
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    vi.mocked(sendRequest).mockClear();

    // Act
    await page.getByTestId('qa-children-skip').click();

    // Assert
    expect(confirm).toHaveBeenCalledOnce();
    expect(uiStore.step).toBe(3);
    expect(sendRequest).not.toHaveBeenCalled();
  });

  async function createNewBooking(): Promise<void> {
    render(Page);
    await expect.element(page.getByTestId('qa-contact-form')).toBeVisible();
    vi.mocked(sendRequest).mockResolvedValue({ data: { documentId: 'new-booking' } });
    await page.getByTestId('qa-contact-first-name').fill('Alex');
    await page.getByTestId('qa-contact-last-name').fill('Example');
    await page.getByTestId('qa-contact-email').fill('alex@example.com');
    await page.getByTestId('qa-contact-phone').fill('+49 123 456789');
    await page.getByTestId('qa-contact-submit').click();
    await expect.element(page.getByTestId('qa-email-verification')).toBeVisible();
  }

  it('ContactSubmission_NewBooking_Expect_SubmittedEmailAndNoFurtherSteps', async () => {
    // Arrange
    // Act
    await createNewBooking();

    // Assert
    await expect
      .element(page.getByTestId('qa-email-verification'))
      .toHaveTextContent('alex@example.com');
    await expect
      .element(page.getByTestId('qa-email-verification'))
      .toHaveTextContent(
        'gesendet. Bitte klicke auf den Link in der E-Mail, um deine E-Mail-Adresse zu bestätigen und fortzufahren.',
      );
    await expect
      .element(page.getByTestId('qa-email-verification'))
      .toHaveTextContent(
        'Falls du keine E-Mail erhalten hast, überprüfe bitte deinen Spam- oder Junk-Ordner.',
      );
    await expect.element(page.getByTestId('qa-address-form')).not.toBeInTheDocument();
    await expect.element(page.getByTestId('qa-contact-form')).not.toBeInTheDocument();
    expect(bookingStore.bookingLoadedFromDatabase.contact_person.email).toBe('alex@example.com');
    expect(bookingStore.hasChanges()).toBe(false);
    expect(uiStore.bookingId).toBe('new-booking');
    expect(sendRequest).toHaveBeenLastCalledWith({
      url: '/api/bookings',
      method: 'POST',
      body: {
        data: {
          contact_person: {
            first_name: 'Alex',
            last_name: 'Example',
            email: 'alex@example.com',
            phone_number: '+49 123 456789',
          },
        },
      },
    });
  });

  it('VerificationResend_Cancelled_Expect_NoRequestAndVerificationRetained', async () => {
    // Arrange
    await createNewBooking();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    vi.mocked(sendRequest).mockClear();

    // Act
    await page.getByTestId('qa-email-resend').click();

    // Assert
    expect(confirm).toHaveBeenCalledWith('E-Mail erneut senden?');
    expect(sendRequest).not.toHaveBeenCalled();
    expect(uiStore.isLoading).toBe(false);
    await expect.element(page.getByTestId('qa-email-verification')).toBeVisible();
  });

  it('VerificationResend_FailureThenRetry_Expect_LoadingErrorRecoveryWithoutAdvancement', async () => {
    // Arrange
    await createNewBooking();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const error = { message: 'Email delivery failed' };
    let rejectRequest!: (reason: unknown) => void;
    vi.mocked(sendRequest)
      .mockClear()
      .mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            rejectRequest = reject;
          }),
      );

    // Act
    await page.getByTestId('qa-email-resend').click();

    // Assert
    await expect.element(page.getByTestId('qa-loading')).toBeVisible();
    await expect.element(page.getByTestId('qa-email-verification')).toBeVisible();
    expect(sendRequest).toHaveBeenCalledExactlyOnceWith({
      url: '/api/bookings/new-booking/send-verification-email',
      method: 'POST',
    });

    // Act
    await page.getByTestId('qa-email-resend').click();
    rejectRequest(error);

    // Assert
    expect(confirm).toHaveBeenCalledTimes(1);
    expect(sendRequest).toHaveBeenCalledTimes(1);
    await expect.element(page.getByTestId('qa-error-modal')).toHaveTextContent(error.message);
    await expect.element(page.getByTestId('qa-loading')).not.toBeInTheDocument();
    await expect.element(page.getByTestId('qa-email-verification')).toBeVisible();

    // Act
    await page.getByTestId('qa-error-dismiss').click();
    vi.mocked(sendRequest).mockResolvedValueOnce({});
    await page.getByTestId('qa-email-resend').click();

    // Assert
    expect(sendRequest).toHaveBeenCalledTimes(2);
    await expect.element(page.getByTestId('qa-error-modal')).not.toBeInTheDocument();
    await expect.element(page.getByTestId('qa-loading')).not.toBeInTheDocument();
    await expect.element(page.getByTestId('qa-email-verification')).toBeVisible();
    await expect.element(page.getByTestId('qa-address-form')).not.toBeInTheDocument();
  });

  it('VerificationResend_MissingBookingId_Expect_NoConfirmationOrRequest', async () => {
    // Arrange
    await createNewBooking();
    uiStore.setBookingId(null);
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.mocked(sendRequest).mockClear();

    // Act
    await page.getByTestId('qa-email-resend').click();

    // Assert
    expect(confirm).not.toHaveBeenCalled();
    expect(sendRequest).not.toHaveBeenCalled();
    expect(uiStore.isLoading).toBe(false);
    await expect.element(page.getByTestId('qa-email-verification')).toBeVisible();
  });
});
