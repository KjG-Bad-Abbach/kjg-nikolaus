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
  import { uiStore, optionsStore, bookingStore, validationStore, derivedStores } from '$lib/stores';
  import { getValidationMessagesForSteps } from '$lib/utils/bookingValidation';
  import { initializeBooking } from '$lib/utils/bookingInit';
  import type { ContactPerson, Location, Child } from '$lib/types/booking';
  import {
    fetchTimeSlots,
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
    derivedStores,
  };

  // Initialize on mount
  onMount(async () => {
    await initializeBooking(storeContext);
  });

  // Bind handlers with context
  const wrappedFetchTimeSlots = () => fetchTimeSlots(uiStore.bookingId, bookingStore, uiStore);
  const wrappedReloadBooking = () => reloadBooking(storeContext);
  const wrappedHandleStepChange = (newStep: number) =>
    handleStepChange(
      newStep,
      uiStore.canJumpToAnyStep,
      bookingStore.hasChanges(),
      bookingStore,
      validationStore,
      uiStore,
      wrappedFetchTimeSlots,
    );
  const wrappedHandleStart = () => handleStart(uiStore);
  const wrappedHandleEditContact = () => handleEditContact(uiStore);
  const wrappedHandleEditAddress = () => handleEditAddress(uiStore);
  const wrappedHandleEditTimeSlots = () => handleEditTimeSlots(uiStore);
  const wrappedHandleEditChildren = () => handleEditChildren(uiStore);

  // Submit handler context
  const submitContext = {
    ...storeContext,
    reloadBooking: wrappedReloadBooking,
  };

  // Bind submit handlers with context
  const wrappedSubmitContactDetails = () => submitContactDetails(submitContext);
  const wrappedSubmitAddressStep = () => submitAddressStep(submitContext);
  const wrappedSubmitTimeSlotsStep = () => submitTimeSlotsStep(submitContext);
  const wrappedSubmitChildrenStep = () => submitChildrenStep(submitContext);

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

<div class="my-4 flex min-h-screen flex-col items-center justify-center bg-java">
  <div class="mx-auto w-full max-w-3xl text-center" data-testid="qa-booking-root">
    <!-- Header -->
    <h1 class="mx-2 mb-4 text-4xl font-bold text-calypso">KjG Nikolaus Buchung</h1>
    <p class="mx-2 text-lg text-calypso">
      Buche deinen persönlichen Nikolausbesuch mit der KjG Bad Abbach!
    </p>

    <!-- Introduction View -->
    {#if uiStore.view === 'intro'}
      <IntroSection
        introductionText={optionsStore.introduction_text}
        onStart={wrappedHandleStart}
      />
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
        onStepChange={wrappedHandleStepChange}
      >
        <!-- Summary Cards -->
        {#if uiStore.step > 0 && uiStore.steps[0].anyFilled}
          <ContactSummary
            contactPerson={bookingStore.booking.contact_person}
            finalDeadline={optionsStore.final_deadline}
            onEdit={wrappedHandleEditContact}
          />
        {/if}

        {#if uiStore.step > 1 && uiStore.steps[1].anyFilled}
          <AddressSummary
            location={bookingStore.booking.location}
            presentLocation={bookingStore.booking.present_location}
            routePlanningDeadline={optionsStore.route_planning_deadline}
            finalDeadline={optionsStore.final_deadline}
            onEdit={wrappedHandleEditAddress}
          />
        {/if}

        {#if uiStore.step > 2 && uiStore.steps[2].anyFilled}
          <TimeSlotSummary
            selectedTimeSlots={bookingStore.booking.time_slots || []}
            maxTimeSlots={optionsStore.max_time_slots}
            routePlanningDeadline={optionsStore.route_planning_deadline}
            onEdit={wrappedHandleEditTimeSlots}
          />
        {/if}

        {#if uiStore.step > 3 && uiStore.steps[3].anyFilled}
          <ChildrenSummary
            children={bookingStore.booking.children}
            additionalNotes={bookingStore.booking.additional_notes}
            finalDeadline={optionsStore.final_deadline}
            onEdit={wrappedHandleEditChildren}
          />
        {/if}

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
