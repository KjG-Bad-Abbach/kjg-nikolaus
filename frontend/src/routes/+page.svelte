<script lang="ts">
  import { onMount } from 'svelte';
  import DeadlineBanner from '$lib/components/DeadlineBanner.svelte';
  import IntroSection from '$lib/components/IntroSection.svelte';
  import StepContainer from '$lib/components/StepContainer.svelte';
  import LoadingOverlay from '$lib/components/LoadingOverlay.svelte';
  import ErrorModal from '$lib/components/ErrorModal.svelte';
  import ContactStep from '$lib/components/steps/ContactStep.svelte';
  import AddressStep from '$lib/components/steps/AddressStep.svelte';
  import TimeSlotStep from '$lib/components/steps/TimeSlotStep.svelte';
  import ChildrenStep from '$lib/components/steps/ChildrenStep.svelte';
  import SummaryStep from '$lib/components/steps/SummaryStep.svelte';
  import ContactSummary from '$lib/components/summary/ContactSummary.svelte';
  import AddressSummary from '$lib/components/summary/AddressSummary.svelte';
  import TimeSlotSummary from '$lib/components/summary/TimeSlotSummary.svelte';
  import ChildrenSummary from '$lib/components/summary/ChildrenSummary.svelte';
  import { sendRequest } from '$lib/api/client';
  import { clone } from '$lib/utils/object';
  import { isFilled, trim } from '$lib/utils/string';
  import { registerCheckUnsavedChanges } from '$lib/utils/unsavedChanges';
  import type {
    Booking,
    TimeSlot,
    Config,
    ApiError,
    ContactPerson,
    Location,
    Child,
  } from '$lib/types/booking';
  import { uiStore, optionsStore, bookingStore, validationStore, derivedStores } from '$lib/stores';

  /**
   * App Shell - Phase 8 of Svelte migration
   * Orchestrates the entire booking application with state management and API integration
   */

  /**
   * Convert validation messages from store format to step component format
   */
  function getValidationMessagesForSteps(): Record<string, string[]> {
    const result: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(validationStore.messages)) {
      result[key] = [value];
    }
    return result;
  }

  // Initialize on mount
  onMount(async () => {
    await init();
  });

  /**
   * Initialize application: load config and booking if ID present
   */
  async function init() {
    if (uiStore.isLoading) {
      return;
    }
    uiStore.setLoading(true);
    uiStore.setError(null);
    bookingStore.reset();

    // Register unsaved changes callback
    registerCheckUnsavedChanges(() => bookingStore.hasChanges());

    try {
      // Load config if not already loaded
      if (!optionsStore.id) {
        const response = await sendRequest<{ data: Config }>({
          url: '/api/config?populate=*',
        });

        optionsStore.update({
          ...response.data,
          route_planning_deadline: new Date(response.data.route_planning_deadline),
          final_deadline: new Date(response.data.final_deadline),
        });

        // Set view based on intro text
        if (optionsStore.introduction_text && optionsStore.introduction_text.length) {
          uiStore.setView('intro');
        } else {
          uiStore.setView('steps');
        }
      }

      // Get booking ID from URL (only in browser)
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const bookingId = searchParams.get('id');
        uiStore.setBookingId(bookingId);

        uiStore.setLoading(false);

        // Load booking if ID present
        if (bookingId) {
          uiStore.setView('steps');
          await updateFromDatabase();
        }
      } else {
        uiStore.setLoading(false);
      }
    } catch (error) {
      console.error(error);
      uiStore.setLoading(false);
      uiStore.setError(error as ApiError, true);
    }
  }

  /**
   * Load booking data from API
   */
  async function updateFromDatabase() {
    if (uiStore.isLoading || !uiStore.bookingId) {
      return;
    }

    uiStore.setLoading(true);
    uiStore.setError(null);
    bookingStore.reset();

    try {
      // Fetch booking
      const response = await sendRequest<{ data: Booking }>({
        url: `/api/bookings/${uiStore.bookingId}?populate=*`,
      });
      const data = clone(response.data);

      // Update booking store
      bookingStore.updateFromDatabase(data);

      // Fetch time slots
      await fetchTimeSlots();
      if (uiStore.error) {
        throw uiStore.error;
      }

      // Store selected time slot IDs
      const selectedIds = (data.time_slots || []).map((slot: TimeSlot) => slot.documentId);
      bookingStore.setSelectedTimeSlotIds(selectedIds);

      // Can jump to any step when editing existing booking
      uiStore.setCanJumpToAnyStep(!!uiStore.bookingId);

      // Navigate to first incomplete step
      await setStepToFirstIncomplete(data);

      // Update step completion status
      updateStepStatus(data);
    } catch (error) {
      console.error(error);
      uiStore.setError(error as ApiError);
    } finally {
      uiStore.setLoading(false);
    }
  }

  /**
   * Fetch available time slots
   */
  async function fetchTimeSlots() {
    try {
      const url = uiStore.bookingId
        ? `/api/time-slots?populate=*&filters[bookings][documentId]=${uiStore.bookingId}`
        : '/api/time-slots?populate=*';

      const response = await sendRequest<{ data: TimeSlot[] }>({ url });

      // Parse dates
      const timeSlots = response.data.map((slot) => ({
        ...slot,
        start: slot.start,
        end: slot.end,
      }));

      bookingStore.setAvailableTimeSlots(timeSlots);
    } catch (error) {
      console.error(error);
      uiStore.setError(error as ApiError);
    }
  }

  /**
   * Navigate to first incomplete step
   */
  async function setStepToFirstIncomplete(data: Booking) {
    let targetStep = 0;

    // Check contact details
    const isContactFilled =
      isFilled(data.contact_person?.first_name) &&
      isFilled(data.contact_person?.last_name) &&
      isFilled(data.contact_person?.email) &&
      isFilled(data.contact_person?.phone_number);

    if (isContactFilled) {
      targetStep = 1;
    }

    // Check address
    const isAddressFilled =
      isFilled(data.location?.street) &&
      isFilled(data.location?.house_number) &&
      isFilled(data.location?.zip_code) &&
      isFilled(data.location?.place);
    const isPresentLocationFilled = isFilled(data.present_location);

    if (isContactFilled && isAddressFilled && isPresentLocationFilled) {
      targetStep = 2;
    }

    // Check time slots
    const areTimeSlotsFilled = (data.time_slots || []).length >= optionsStore.max_time_slots;

    if (isContactFilled && isAddressFilled && isPresentLocationFilled && areTimeSlotsFilled) {
      targetStep = 3;
    }

    // Check children
    const areChildrenFilled =
      (data.children || []).length > 0 &&
      data.children!.every(
        (child) =>
          isFilled(child.name) && isFilled(child.identification_trait) && isFilled(child.speech),
      );

    if (
      isContactFilled &&
      isAddressFilled &&
      isPresentLocationFilled &&
      areTimeSlotsFilled &&
      areChildrenFilled
    ) {
      targetStep = 4;
    }

    uiStore.setStep(targetStep);
  }

  /**
   * Update step completion status
   */
  function updateStepStatus(data: Booking) {
    // Step 0: Contact
    const isContactFilled =
      isFilled(data.contact_person?.first_name) &&
      isFilled(data.contact_person?.last_name) &&
      isFilled(data.contact_person?.email) &&
      isFilled(data.contact_person?.phone_number);

    uiStore.updateStep(0, {
      allFilled: isContactFilled,
      anyFilled:
        isFilled(data.contact_person?.first_name) ||
        isFilled(data.contact_person?.last_name) ||
        isFilled(data.contact_person?.email) ||
        isFilled(data.contact_person?.phone_number),
    });

    // Step 1: Address
    const isAddressFilled =
      isFilled(data.location?.street) &&
      isFilled(data.location?.house_number) &&
      isFilled(data.location?.zip_code) &&
      isFilled(data.location?.place);
    const isPresentLocationFilled = isFilled(data.present_location);

    uiStore.updateStep(1, {
      allFilled: isAddressFilled && isPresentLocationFilled,
      anyFilled:
        isFilled(data.location?.street) ||
        isFilled(data.location?.house_number) ||
        isFilled(data.location?.zip_code) ||
        isFilled(data.location?.place) ||
        isFilled(data.present_location),
    });

    // Step 2: Time Slots
    const areTimeSlotsFilled = (data.time_slots || []).length >= optionsStore.max_time_slots;
    uiStore.updateStep(2, {
      allFilled: areTimeSlotsFilled,
      anyFilled: (data.time_slots || []).length > 0,
    });

    // Step 3: Children
    const areChildrenFilled =
      (data.children || []).length > 0 &&
      data.children!.every(
        (child) =>
          isFilled(child.name) && isFilled(child.identification_trait) && isFilled(child.speech),
      );

    uiStore.updateStep(3, {
      allFilled: areChildrenFilled,
      anyFilled: (data.children || []).length > 0 || isFilled(data.additional_notes),
    });

    // Step 4: Summary
    uiStore.updateStep(4, {
      allFilled: derivedStores.isEverythingFilled,
      anyFilled: false,
    });
  }

  /**
   * Handle step change
   */
  async function handleStepChange(newStep: number) {
    if (uiStore.canJumpToAnyStep) {
      // Check for unsaved changes
      if (bookingStore.hasChanges()) {
        // Only show confirm dialog in browser environment
        if (typeof window !== 'undefined') {
          if (!confirm('Wenn Sie fortfahren, werden Ihre Änderungen verloren gehen. Fortfahren?')) {
            return;
          }
        }
        // Revert to database state
        bookingStore.revertToDatabase();
        await fetchTimeSlots();
      }

      validationStore.clearAll();
      uiStore.setStep(newStep);

      // Fetch time slots when navigating to time slot step
      if (newStep === 2) {
        await fetchTimeSlots();
      }
    }
  }

  /**
   * Handle start button (move from intro to steps)
   */
  function handleStart() {
    uiStore.setView('steps');
  }

  /**
   * Handle edit button clicks from summary cards
   */
  function handleEditContact() {
    uiStore.setStep(0);
  }

  function handleEditAddress() {
    uiStore.setStep(1);
  }

  function handleEditTimeSlots() {
    uiStore.setStep(2);
  }

  function handleEditChildren() {
    uiStore.setStep(3);
  }

  /**
   * Submit contact details (Step 0)
   */
  async function submitContactDetails(event: Event) {
    event.preventDefault();

    if (uiStore.isLoading) {
      return;
    }

    uiStore.setLoading(true);
    uiStore.setError(null);
    validationStore.clearAll();

    try {
      // Clean input
      const contact = bookingStore.booking.contact_person;
      contact.first_name = trim(contact.first_name);
      contact.last_name = trim(contact.last_name);
      contact.email = trim(contact.email);
      contact.phone_number = trim(contact.phone_number);

      // Validate required fields
      if (!isFilled(contact.first_name)) {
        validationStore.setMessage(
          'booking.contact_person.first_name',
          'Eingabe ist erforderlich.',
        );
      }
      if (!isFilled(contact.last_name)) {
        validationStore.setMessage('booking.contact_person.last_name', 'Eingabe ist erforderlich.');
      }
      if (!isFilled(contact.email)) {
        validationStore.setMessage('booking.contact_person.email', 'Eingabe ist erforderlich.');
      }
      if (!isFilled(contact.phone_number)) {
        validationStore.setMessage(
          'booking.contact_person.phone_number',
          'Eingabe ist erforderlich.',
        );
      }

      if (Object.keys(validationStore.messages).length > 0) {
        return;
      }

      const hadBookingId = !!uiStore.bookingId;

      const response = await sendRequest<{ data: Booking }>({
        url: uiStore.bookingId ? `/api/bookings/${uiStore.bookingId}` : '/api/bookings',
        method: uiStore.bookingId ? 'PUT' : 'POST',
        body: {
          data: {
            contact_person: contact,
          },
        },
      });

      uiStore.setBookingId(response.data.documentId!);

      if (hadBookingId) {
        // Reload data
        uiStore.setView('steps');
        await init();
      } else {
        // New booking - show email verification needed
        // For now, just update state
        bookingStore.updateFromDatabase({ contact_person: contact });
        // TODO: Show email verification view
        uiStore.setView('steps');
      }

      uiStore.setStep(1);
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      uiStore.setError(apiError);
      // Extract validation errors
      const errors = apiError.body?.error?.details?.errors;
      if (errors?.length) {
        for (const err of errors) {
          const path = `booking.${err.path.join('.')}`;
          let msg = err.message.startsWith(err.path.join('.') + ' ')
            ? err.message.substring((err.path.join('.') + ' ').length)
            : err.message;
          if (msg === 'must match the following: "/^\\+?[-\\s\\.0-9]+$/"') {
            msg =
              "Die Telefonnummer muss im Format '01234 56789', '01234 567-89', '+49 123 456789' oder '0049 123 456789' sein.";
          }
          validationStore.setMessage(path, msg);
        }
      }
    } finally {
      uiStore.setLoading(false);
    }
  }

  /**
   * Submit address (Step 1)
   */
  async function submitAddress(event: Event) {
    event.preventDefault();

    if (uiStore.isLoading || !uiStore.bookingId) {
      return;
    }

    uiStore.setLoading(true);
    uiStore.setError(null);
    validationStore.clearAll();

    try {
      // Clean input
      const { location, present_location } = bookingStore.booking;
      location.street = trim(location.street);
      location.house_number = trim(location.house_number);
      location.zip_code = trim(location.zip_code);
      location.place = trim(location.place);
      const presentLocation = trim(present_location);

      // Validate
      if (!derivedStores.canEditRoutePlanning) {
        if (!isFilled(presentLocation)) {
          validationStore.setMessage('booking.present_location', 'Eingabe ist erforderlich.');
        }
      } else {
        if (!isFilled(location.street)) {
          validationStore.setMessage('booking.location.street', 'Eingabe ist erforderlich.');
        }
        if (!isFilled(location.house_number)) {
          validationStore.setMessage('booking.location.house_number', 'Eingabe ist erforderlich.');
        }
        if (!isFilled(location.zip_code)) {
          validationStore.setMessage('booking.location.zip_code', 'Eingabe ist erforderlich.');
        }
        if (!isFilled(location.place)) {
          validationStore.setMessage('booking.location.place', 'Eingabe ist erforderlich.');
        }
        if (!isFilled(presentLocation)) {
          validationStore.setMessage('booking.present_location', 'Eingabe ist erforderlich.');
        }
      }

      if (Object.keys(validationStore.messages).length > 0) {
        return;
      }

      await sendRequest({
        url: `/api/bookings/${uiStore.bookingId}`,
        method: 'PUT',
        body: {
          data: {
            location,
            present_location: presentLocation,
          },
        },
      });

      await init();
      uiStore.setStep(2);
    } catch (error) {
      console.error(error);
      const apiError = error as ApiError;
      uiStore.setError(apiError);
      // Extract validation errors
      const errors = apiError.body?.error?.details?.errors;
      if (errors?.length) {
        for (const err of errors) {
          validationStore.setMessage(`booking.${err.path.join('.')}`, err.message);
        }
      }
    } finally {
      uiStore.setLoading(false);
    }
  }

  /**
   * Submit time slots (Step 2)
   */
  async function submitTimeSlots(event: Event) {
    event.preventDefault();

    if (uiStore.isLoading || !uiStore.bookingId) {
      return;
    }

    uiStore.setLoading(true);
    uiStore.setError(null);
    validationStore.clearAll();

    try {
      // Validate
      if (bookingStore.selectedTimeSlotIds.length < optionsStore.max_time_slots) {
        validationStore.setMessage(
          'booking.time_slots',
          `Bitte wähle ${optionsStore.max_time_slots} Zeitslots aus.`,
        );
        return;
      }

      await sendRequest({
        url: `/api/bookings/${uiStore.bookingId}`,
        method: 'PUT',
        body: {
          data: {
            time_slots: bookingStore.selectedTimeSlotIds,
          },
        },
      });

      await init();
      uiStore.setStep(3);
    } catch (error) {
      console.error(error);
      uiStore.setError(error as ApiError);
    } finally {
      uiStore.setLoading(false);
    }
  }

  /**
   * Submit children (Step 3)
   */
  async function submitChildren(event: Event) {
    event.preventDefault();

    if (uiStore.isLoading || !uiStore.bookingId) {
      return;
    }

    uiStore.setLoading(true);
    uiStore.setError(null);
    validationStore.clearAll();

    try {
      const { children, additional_notes } = bookingStore.booking;

      // Clean input
      children.forEach((child) => {
        child.name = trim(child.name);
        child.identification_trait = trim(child.identification_trait);
        child.speech = trim(child.speech);
      });

      // Validate
      if (children.length === 0) {
        validationStore.setMessage('booking.children', 'Bitte füge mindestens ein Kind hinzu.');
        return;
      }

      children.forEach((child, index) => {
        if (!isFilled(child.name)) {
          validationStore.setMessage(`booking.children.${index}.name`, 'Eingabe ist erforderlich.');
        }
        if (!isFilled(child.identification_trait)) {
          validationStore.setMessage(
            `booking.children.${index}.identification_trait`,
            'Eingabe ist erforderlich.',
          );
        }
        if (!isFilled(child.speech)) {
          validationStore.setMessage(
            `booking.children.${index}.speech`,
            'Eingabe ist erforderlich.',
          );
        }
      });

      if (Object.keys(validationStore.messages).length > 0) {
        return;
      }

      await sendRequest({
        url: `/api/bookings/${uiStore.bookingId}`,
        method: 'PUT',
        body: {
          data: {
            children,
            additional_notes: trim(additional_notes),
          },
        },
      });

      await init();
      uiStore.setStep(4);
    } catch (error) {
      console.error(error);
      uiStore.setError(error as ApiError);
    } finally {
      uiStore.setLoading(false);
    }
  }

  /**
   * Handle field changes
   */
  function handleContactChange(contact: ContactPerson) {
    bookingStore.updateField('contact_person', contact);
  }

  function handleAddressChange(data: { location: Location; presentLocation: string }) {
    bookingStore.updateField('location', data.location);
    bookingStore.updateField('present_location', data.presentLocation);
  }

  function handleTimeSlotChange(selectedIds: string[]) {
    bookingStore.setSelectedTimeSlotIds(selectedIds);
  }

  function handleChildrenChange(data: { children: Child[]; additionalNotes: string }) {
    bookingStore.updateField('children', data.children);
    bookingStore.updateField('additional_notes', data.additionalNotes);
  }
</script>

<div class="my-4 flex min-h-screen flex-col items-center justify-center bg-java">
  <div class="mx-auto w-full max-w-3xl text-center" data-testid="qa-booking-root">
    <!-- Header -->
    <h1 class="mx-2 mb-4 text-4xl font-bold text-calypso">KjG Nikolaus Buchung</h1>
    <p class="mx-2 text-lg text-calypso">
      Buche deinen persönlichen Nikolausbesuch mit der KjG Bad Abbach!
    </p>

    <!-- Introduction View -->
    {#if uiStore.view === 'intro'}
      <IntroSection introductionText={optionsStore.introduction_text} onStart={handleStart} />
    {/if}

    <!-- Deadline Banner -->
    <DeadlineBanner
      routePlanningDeadline={optionsStore.route_planning_deadline}
      finalDeadline={optionsStore.final_deadline}
      canEditRoutePlanning={derivedStores.canEditRoutePlanning}
      canEditAnything={derivedStores.canEditAnything}
    />

    <!-- Loading Overlay -->
    <LoadingOverlay isLoading={uiStore.isLoading} />

    <!-- Steps View -->
    {#if uiStore.view === 'steps'}
      <StepContainer
        currentStep={uiStore.step}
        steps={uiStore.steps}
        canJumpToAnyStep={uiStore.canJumpToAnyStep}
        onStepChange={handleStepChange}
      >
        <!-- Summary Cards -->
        {#if uiStore.step > 0 && uiStore.steps[0].anyFilled}
          <ContactSummary
            contactPerson={bookingStore.booking.contact_person}
            finalDeadline={optionsStore.final_deadline}
            onEdit={handleEditContact}
          />
        {/if}

        {#if uiStore.step > 1 && uiStore.steps[1].anyFilled}
          <AddressSummary
            location={bookingStore.booking.location}
            presentLocation={bookingStore.booking.present_location}
            routePlanningDeadline={optionsStore.route_planning_deadline}
            finalDeadline={optionsStore.final_deadline}
            onEdit={handleEditAddress}
          />
        {/if}

        {#if uiStore.step > 2 && uiStore.steps[2].anyFilled}
          <TimeSlotSummary
            selectedTimeSlots={bookingStore.booking.time_slots || []}
            maxTimeSlots={optionsStore.max_time_slots}
            routePlanningDeadline={optionsStore.route_planning_deadline}
            onEdit={handleEditTimeSlots}
          />
        {/if}

        {#if uiStore.step > 3 && uiStore.steps[3].anyFilled}
          <ChildrenSummary
            children={bookingStore.booking.children}
            additionalNotes={bookingStore.booking.additional_notes}
            finalDeadline={optionsStore.final_deadline}
            onEdit={handleEditChildren}
          />
        {/if}

        <!-- Step Content -->
        {#if uiStore.step === 0}
          <ContactStep
            contactPerson={bookingStore.booking.contact_person}
            finalDeadline={optionsStore.final_deadline}
            canEdit={derivedStores.canEditAnything}
            validationMessages={getValidationMessagesForSteps()}
            onChange={handleContactChange}
            onSubmit={submitContactDetails}
          />
        {:else if uiStore.step === 1}
          <AddressStep
            location={bookingStore.booking.location}
            presentLocation={bookingStore.booking.present_location}
            routePlanningDeadline={optionsStore.route_planning_deadline}
            finalDeadline={optionsStore.final_deadline}
            canEditRoutePlanning={derivedStores.canEditRoutePlanning}
            canEditAnything={derivedStores.canEditAnything}
            validationMessages={getValidationMessagesForSteps()}
            onChange={handleAddressChange}
            onSubmit={submitAddress}
          />
        {:else if uiStore.step === 2}
          <TimeSlotStep
            availableTimeSlots={bookingStore.availableTimeSlots}
            selectedTimeSlotIds={bookingStore.selectedTimeSlotIds}
            maxTimeSlots={optionsStore.max_time_slots}
            routePlanningDeadline={optionsStore.route_planning_deadline}
            canEditRoutePlanning={derivedStores.canEditRoutePlanning}
            showSearch={optionsStore.show_search_for_time_slots}
            validationMessages={getValidationMessagesForSteps()}
            onChange={handleTimeSlotChange}
            onSubmit={submitTimeSlots}
          />
        {:else if uiStore.step === 3}
          <ChildrenStep
            children={bookingStore.booking.children}
            additionalNotes={bookingStore.booking.additional_notes}
            finalDeadline={optionsStore.final_deadline}
            canEditAnything={derivedStores.canEditAnything}
            validationMessages={getValidationMessagesForSteps()}
            onChange={handleChildrenChange}
            onSubmit={submitChildren}
          />
        {:else if uiStore.step === 4}
          <SummaryStep
            isRoutePlanningFilled={derivedStores.isRoutePlanningFilled}
            isEverythingFilled={derivedStores.isEverythingFilled}
            routePlanningDeadline={optionsStore.route_planning_deadline}
            finalDeadline={optionsStore.final_deadline}
          />
        {/if}
      </StepContainer>
    {/if}

    <!-- Error Modal -->
    {#if uiStore.error}
      <ErrorModal
        error={uiStore.error}
        askToReload={uiStore.askToReload}
        onClose={() => uiStore.closeError()}
      />
    {/if}
  </div>
</div>
