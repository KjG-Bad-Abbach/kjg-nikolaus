<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import StepIndicator from './StepIndicator.svelte';

  const { Story } = defineMeta({
    component: StepIndicator,
    title: 'Components/Stepper/StepIndicator',
    tags: ['autodocs'],
  });
</script>

<Story
  name="Default (Not Filled)"
  args={{
    index: 0,
    name: 'Contact Details',
    testId: 'contact',
    isCurrent: false,
    allFilled: false,
    canJumpTo: false,
  }}
/>

<Story
  name="Current Step"
  args={{
    index: 0,
    name: 'Contact Details',
    testId: 'contact',
    isCurrent: true,
    allFilled: false,
    canJumpTo: true,
  }}
/>

<Story
  name="Filled Step"
  args={{
    index: 0,
    name: 'Contact Details',
    testId: 'contact',
    isCurrent: false,
    allFilled: true,
    canJumpTo: true,
  }}
/>

<Story
  name="Current and Filled"
  args={{
    index: 0,
    name: 'Contact Details',
    testId: 'contact',
    isCurrent: true,
    allFilled: true,
    canJumpTo: true,
  }}
/>

<Story
  name="Cannot Jump To"
  args={{
    index: 2,
    name: 'Time Slots',
    testId: 'time-slots',
    isCurrent: false,
    allFilled: false,
    canJumpTo: false,
  }}
/>

<!-- Demo showing all states in sequence -->
<Story name="All States">
  <div class="flex items-center gap-4 p-4">
    <StepIndicator
      index={0}
      name="Step 1"
      testId="step-1"
      isCurrent={false}
      allFilled={false}
      canJumpTo={false}
    />
    <StepIndicator
      index={1}
      name="Step 2"
      testId="step-2"
      isCurrent={true}
      allFilled={false}
      canJumpTo={true}
    />
    <StepIndicator
      index={2}
      name="Step 3"
      testId="step-3"
      isCurrent={false}
      allFilled={true}
      canJumpTo={true}
    />
  </div>
</Story>
