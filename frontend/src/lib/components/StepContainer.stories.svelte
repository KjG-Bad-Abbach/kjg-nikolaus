<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import StepContainer from './StepContainer.svelte';

  const { Story } = defineMeta({
    component: StepContainer,
    title: 'Components/StepContainer',
    tags: ['autodocs'],
  });

  const sampleBooking = {
    contact_person: {
      first_name: 'Max',
      last_name: 'Mustermann',
      email: 'max@example.com',
      phone_number: '+49 123 456789',
    },
    location: {
      street: 'Hauptstraße',
      house_number: '123',
      zip_code: '12345',
      place: 'Berlin',
    },
    present_location: 'Wohnzimmer',
    children: [
      {
        name: 'Anna',
        identification_trait: 'Blonde Haare',
        speech: 'Hat fleißig gelernt',
      },
    ],
    time_slots: [],
    additional_notes: 'Bitte klingeln',
  };

  const sampleSteps = [
    { name: 'Kontakt', testId: 'contact', anyFilled: true, allFilled: true },
    { name: 'Adresse', testId: 'address', anyFilled: true, allFilled: true },
    { name: 'Zeitslots', testId: 'timeslots', anyFilled: false, allFilled: false },
    { name: 'Kinder', testId: 'children', anyFilled: true, allFilled: false },
    { name: 'Übersicht', testId: 'summary', anyFilled: false, allFilled: false },
  ];
</script>

<Story
  name="First Step"
  args={{
    currentStep: 0,
    steps: sampleSteps,
    booking: sampleBooking,
    canJumpToAnyStep: true,
    onStepChange: (step) => console.log('Navigate to step:', step),
  }}
/>

<Story
  name="Middle Step"
  args={{
    currentStep: 2,
    steps: sampleSteps,
    booking: sampleBooking,
    canJumpToAnyStep: true,
    onStepChange: (step) => console.log('Navigate to step:', step),
  }}
/>

<Story
  name="Last Step"
  args={{
    currentStep: 4,
    steps: sampleSteps,
    booking: sampleBooking,
    canJumpToAnyStep: true,
    onStepChange: (step) => console.log('Navigate to step:', step),
  }}
/>

<Story
  name="No Jump Navigation"
  args={{
    currentStep: 1,
    steps: sampleSteps,
    booking: sampleBooking,
    canJumpToAnyStep: false,
    onStepChange: (step) => console.log('Navigate to step:', step),
  }}
/>

<Story
  name="Empty Booking"
  args={{
    currentStep: 0,
    steps: [
      { name: 'Kontakt', testId: 'contact', anyFilled: false, allFilled: false },
      { name: 'Adresse', testId: 'address', anyFilled: false, allFilled: false },
      { name: 'Zeitslots', testId: 'timeslots', anyFilled: false, allFilled: false },
    ],
    booking: {
      contact_person: {
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
      },
      location: {
        street: '',
        house_number: '',
        zip_code: '',
        place: '',
      },
      present_location: '',
      children: [],
      time_slots: [],
      additional_notes: '',
    },
    canJumpToAnyStep: false,
    onStepChange: (step) => console.log('Navigate to step:', step),
  }}
/>

<!-- Interactive demo -->
<Story name="Interactive">
  <div class="p-4">
    <StepContainer
      currentStep={1}
      steps={sampleSteps}
      canJumpToAnyStep={true}
      onStepChange={(step) => alert(`Navigating to step ${step + 1}`)}
    />
  </div>
</Story>
