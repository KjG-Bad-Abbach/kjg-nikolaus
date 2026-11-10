<script lang="ts">
  import { onMount } from 'svelte';
  import { SvelteDate } from 'svelte/reactivity';
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
  import { uiStore, optionsStore, bookingStore, validationStore, derivedStores } from '$lib/stores';
  import { getValidationMessagesForSteps } from '$lib/utils/bookingValidation';
  import { initializeBooking } from '$lib/utils/bookingInit';
  import type { ContactPerson, Location, Child } from '$lib/types/booking';
  import {
    reloadBooking,
    handleStepChange,
    handleStart,
    handleEditContact,
    handleEditAddress,
    handleEditTimeSlots,
    handleEditChildren,
  } from '$lib/handlers/pageHandlers';
  import {
    handleContactChange,
    handleAddressChange,
    handleTimeSlotChange,
    handleChildrenChange,
  } from '$lib/handlers/changeHandlers';
  import {
    submitContactDetails,
    sendEmailVerification,
    submitAddressStep,
    submitTimeSlotsStep,
    submitChildrenStep,
  } from '$lib/handlers/submitHandlers';

  /**
   * App Shell - Phase 8 of Svelte migration (Refactored)
   * Orchestrates the entire booking application with state management and API integration
   * Business logic extracted to utility and handler modules for better testability
   */

  // Create store context for handlers
  const storeContext = {
    uiStore,
    bookingStore,
    validationStore,
    optionsStore,
  };

  // Initialize on mount
  onMount(() => {
    derivedStores.setCurrentTime(Date.now());
    const clockInterval_ms = 1000;
    const clockInterval = setInterval(
      () => derivedStores.setCurrentTime(Date.now()),
      clockInterval_ms,
    );
    void initializeBooking(storeContext);
    return () => clearInterval(clockInterval);
  });

  // Bind handlers with context
  const wrappedReloadBooking = () => reloadBooking(storeContext);
  const wrappedHandleStepChange = (newStep: number) => handleStepChange(newStep, storeContext);
  const wrappedHandleStart = () => handleStart(uiStore);
  const wrappedHandleEditContact = () => handleEditContact(storeContext);
  const wrappedHandleEditAddress = () => handleEditAddress(storeContext);
  const wrappedHandleEditTimeSlots = () => handleEditTimeSlots(storeContext);
  const wrappedHandleEditChildren = () => handleEditChildren(storeContext);

  // Submit handler context
  const submitContext = {
    ...storeContext,
    reloadBooking: wrappedReloadBooking,
  };

  // Bind submit handlers with context
  const wrappedSubmitContactDetails = (contact: ContactPerson): Promise<void> => {
    handleContactChange(contact, bookingStore);
    return submitContactDetails(submitContext);
  };
  const wrappedSendEmailVerification = (): Promise<void> => sendEmailVerification(submitContext);
  const wrappedSubmitAddressStep = (data: Parameters<typeof handleAddressChange>[0]) => {
    handleAddressChange(data, bookingStore);
    return submitAddressStep(submitContext);
  };
  const wrappedSubmitTimeSlotsStep = (selectedIds: string[]) => {
    handleTimeSlotChange(selectedIds, bookingStore);
    return submitTimeSlotsStep(submitContext);
  };
  const wrappedSubmitChildrenStep = (data: Parameters<typeof handleChildrenChange>[0]) => {
    handleChildrenChange(data, bookingStore);
    return submitChildrenStep(submitContext);
  };

  // Bind change handlers with context
  const wrappedHandleContactChange = (contact: ContactPerson) =>
    handleContactChange(contact, bookingStore);
  const wrappedHandleAddressChange = (data: { location: Location; presentLocation: string }) =>
    handleAddressChange(data, bookingStore);
  const wrappedHandleTimeSlotChange = (selectedIds: string[]) =>
    handleTimeSlotChange(selectedIds, bookingStore);
  const wrappedHandleChildrenChange = (data: { children: Child[]; additionalNotes: string }) =>
    handleChildrenChange(data, bookingStore);
</script>

<svelte:head>
  <title>KjG Nikolaus Buchung</title>
</svelte:head>

<div class="mx-auto w-full max-w-3xl text-center" data-testid="qa-booking-root">
  <!-- Header -->
  <h1 class="mx-2 mb-4 text-4xl font-bold text-calypso">KjG Nikolaus Buchung</h1>
  <p class="mx-2 text-lg text-calypso">
    Buche deinen persönlichen Nikolausbesuch mit der KjG Bad Abbach!
  </p>

  <!-- Introduction View -->
  {#if uiStore.view === 'intro'}
    <IntroSection introductionText={optionsStore.introduction_text} onStart={wrappedHandleStart} />
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
    <div data-testid="qa-view-steps">
      <StepContainer
        currentStep={uiStore.step}
        steps={uiStore.steps}
        canJumpToAnyStep={uiStore.canJumpToAnyStep}
        onStepChange={wrappedHandleStepChange}
      />
      <!-- Summary Cards -->
      <div class="mx-4 mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {#if (uiStore.step !== 0 && uiStore.steps[0].anyFilled) || uiStore.step === 4}
          <ContactSummary
            contactPerson={bookingStore.booking.contact_person}
            finalDeadline={optionsStore.final_deadline}
            onEdit={wrappedHandleEditContact}
          />
        {/if}

        {#if (uiStore.step !== 1 && uiStore.steps[1].anyFilled) || uiStore.step === 4}
          <AddressSummary
            location={bookingStore.booking.location}
            presentLocation={bookingStore.booking.present_location}
            routePlanningDeadline={optionsStore.route_planning_deadline}
            finalDeadline={optionsStore.final_deadline}
            onEdit={wrappedHandleEditAddress}
          />
        {/if}

        {#if (uiStore.step !== 2 && uiStore.steps[2].anyFilled) || uiStore.step === 4}
          <TimeSlotSummary
            selectedTimeSlots={bookingStore.availableTimeSlots.filter((slot) =>
              bookingStore.selectedTimeSlotIds.includes(slot.documentId),
            )}
            maxTimeSlots={optionsStore.max_time_slots}
            routePlanningDeadline={optionsStore.route_planning_deadline}
            onEdit={wrappedHandleEditTimeSlots}
          />
        {/if}

        {#if (uiStore.step !== 3 && uiStore.steps[3].anyFilled) || uiStore.step === 4}
          <ChildrenSummary
            children={bookingStore.booking.children}
            additionalNotes={bookingStore.booking.additional_notes}
            finalDeadline={optionsStore.final_deadline}
            onEdit={wrappedHandleEditChildren}
          />
        {/if}
      </div>

      <!-- Step Content -->
      {#if uiStore.step === 0}
        <ContactStep
          contactPerson={bookingStore.booking.contact_person}
          finalDeadline={optionsStore.final_deadline}
          canEdit={derivedStores.canEditAnything}
          validationMessages={getValidationMessagesForSteps(validationStore.messages)}
          onChange={wrappedHandleContactChange}
          onSubmit={wrappedSubmitContactDetails}
        />
      {:else if uiStore.step === 1}
        <AddressStep
          location={bookingStore.booking.location}
          presentLocation={bookingStore.booking.present_location}
          routePlanningDeadline={optionsStore.route_planning_deadline}
          finalDeadline={optionsStore.final_deadline}
          canEditRoutePlanning={derivedStores.canEditRoutePlanning}
          canEditAnything={derivedStores.canEditAnything}
          validationMessages={getValidationMessagesForSteps(validationStore.messages)}
          onChange={wrappedHandleAddressChange}
          onSubmit={wrappedSubmitAddressStep}
        />
      {:else if uiStore.step === 2}
        <TimeSlotStep
          availableTimeSlots={bookingStore.availableTimeSlots}
          selectedTimeSlotIds={bookingStore.selectedTimeSlotIds}
          maxTimeSlots={optionsStore.max_time_slots}
          routePlanningDeadline={optionsStore.route_planning_deadline}
          canEditRoutePlanning={derivedStores.canEditRoutePlanning}
          showSearch={optionsStore.show_search_for_time_slots}
          bind:searchQuery={bookingStore.timeSlotSearchQuery}
          validationMessages={getValidationMessagesForSteps(validationStore.messages)}
          onChange={wrappedHandleTimeSlotChange}
          onSubmit={wrappedSubmitTimeSlotsStep}
        />
      {:else if uiStore.step === 3}
        <ChildrenStep
          children={bookingStore.booking.children}
          additionalNotes={bookingStore.booking.additional_notes}
          finalDeadline={optionsStore.final_deadline}
          canEditAnything={derivedStores.canEditAnything}
          validationMessages={getValidationMessagesForSteps(validationStore.messages)}
          onChange={wrappedHandleChildrenChange}
          onSubmit={wrappedSubmitChildrenStep}
          onSkip={() => wrappedHandleStepChange(4)}
        />
      {:else if uiStore.step === 4}
        <SummaryStep
          isRoutePlanningFilled={derivedStores.isRoutePlanningFilled}
          isEverythingFilled={derivedStores.isEverythingFilled}
          routePlanningDeadline={optionsStore.route_planning_deadline}
          finalDeadline={optionsStore.final_deadline}
        />
      {/if}
    </div>
  {/if}

  <!-- View for email verification needed -->
  {#if uiStore.view === 'email-verification-needed'}
    <div
      class="mx-auto mt-8 w-full max-w-3xl rounded-lg bg-white p-6 shadow-md"
      data-testid="qa-email-verification"
    >
      <h2 class="mb-4 text-2xl font-bold text-surfie-green">E-Mail-Verifizierung</h2>

      <p class="text-gray-700">
        Wir haben dir eine E-Mail an
        <span class="font-bold">{bookingStore.booking.contact_person.email}</span>
        gesendet. Bitte klicke auf den Link in der E-Mail, um deine E-Mail-Adresse zu bestätigen und fortzufahren.
      </p>

      <p class="mt-4 text-gray-700">
        Falls du keine E-Mail erhalten hast, überprüfe bitte deinen Spam- oder Junk-Ordner.
      </p>

      <div class="mt-6">
        <button
          type="button"
          onclick={wrappedSendEmailVerification}
          data-testid="qa-email-resend"
          class="w-full rounded-sm bg-atlantis px-4 py-2 font-bold text-white hover:bg-surfie-green focus:ring-2 focus:ring-java/50 focus:outline-hidden"
        >
          E-Mail erneut senden
        </button>
      </div>
    </div>
  {/if}

  <!-- Footer -->
  <footer class="mt-8 w-full p-4 text-center text-sm text-gray-700">
    <p>© {new SvelteDate().getFullYear()} KjG Bad Abbach</p>
    <div>
      {#if optionsStore.legal_notice_link}
        <!-- CMS links are external URLs, not application routes. -->
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a href={optionsStore.legal_notice_link} class="text-gray-700 hover:text-gray-900">
          Impressum
        </a>
      {/if}
      {#if optionsStore.legal_notice_link && optionsStore.privacy_policy_link}
        <span class="mx-2">|</span>
      {/if}
      {#if optionsStore.privacy_policy_link}
        <!-- CMS links are external URLs, not application routes. -->
        <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
        <a href={optionsStore.privacy_policy_link} class="text-gray-700 hover:text-gray-900">
          Datenschutz
        </a>
      {/if}
    </div>
    <div>Alle Daten werden nach der Aktion vollständig gelöscht.</div>
  </footer>

  <!-- Error Modal -->
  {#if uiStore.error}
    <ErrorModal
      error={uiStore.error}
      askToReload={uiStore.askToReload}
      onClose={() => uiStore.closeError()}
      onRetry={() => initializeBooking(storeContext)}
    />
  {/if}
</div>
