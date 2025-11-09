<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import StepContainer from './StepContainer.svelte';
  import type { Props } from './StepContainer.svelte';

  const sampleSteps = [
    { name: 'Kontakt', testId: 'contact', anyFilled: true, allFilled: true },
    { name: 'Adresse', testId: 'address', anyFilled: true, allFilled: true },
    { name: 'Zeitslots', testId: 'timeslots', anyFilled: false, allFilled: false },
    { name: 'Kinder', testId: 'children', anyFilled: true, allFilled: false },
    { name: 'Übersicht', testId: 'summary', anyFilled: false, allFilled: false },
  ];

  const { Story } = defineMeta({
    component: StepContainer,
    title: 'Components/StepContainer',
    tags: ['autodocs'],
    args: {
      steps: sampleSteps,
      canJumpToAnyStep: true,
      onStepChange: fn(),
    },
  });
</script>

{#snippet template(args: Props)}
  <div class="bg-java p-4">
    <StepContainer {...args}>
      <div class="rounded-lg bg-white p-4 shadow-sm">
        <p class="text-gray-600">This is the content for the current step.</p>
        <p class="mt-2 text-sm text-gray-500">You can customize this content in the Playground.</p>
      </div>
    </StepContainer>
  </div>
{/snippet}

<Story
  name="Playground"
  args={{
    currentStep: 1,
  }}
  {template}
/>

<Story
  name="First Step"
  args={{
    currentStep: 0,
  }}
  {template}
/>

<Story
  name="Middle Step"
  args={{
    currentStep: 2,
  }}
  {template}
/>

<Story
  name="Last Step"
  args={{
    currentStep: 4,
  }}
  {template}
/>

<Story
  name="No Jump Navigation"
  args={{
    currentStep: 1,
    canJumpToAnyStep: false,
  }}
  {template}
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
    canJumpToAnyStep: false,
  }}
  {template}
/>
