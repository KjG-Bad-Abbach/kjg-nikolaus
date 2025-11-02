<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import StepList from './StepList.svelte';

  const { Story } = defineMeta({
    component: StepList,
    title: 'Components/Stepper/StepList',
    tags: ['autodocs'],
  });

  const mockSteps = [
    { name: 'Contact Details', testId: 'contact', anyFilled: true, allFilled: true },
    { name: 'Address', testId: 'address', anyFilled: true, allFilled: false },
    { name: 'Time Slots', testId: 'time-slots', anyFilled: false, allFilled: false },
    { name: 'Children', testId: 'children', anyFilled: false, allFilled: false },
    { name: 'Summary', testId: 'summary', anyFilled: false, allFilled: false },
  ];
</script>

<Story
  name="First Step Active"
  args={{
    steps: mockSteps,
    currentStep: 0,
    canJumpToAnyStep: false,
  }}
/>

<Story
  name="Second Step Active"
  args={{
    steps: mockSteps,
    currentStep: 1,
    canJumpToAnyStep: false,
  }}
/>

<Story
  name="Last Step Active"
  args={{
    steps: mockSteps,
    currentStep: 4,
    canJumpToAnyStep: false,
  }}
/>

<Story
  name="Can Jump To Any Step"
  args={{
    steps: mockSteps,
    currentStep: 2,
    canJumpToAnyStep: true,
  }}
/>

<Story
  name="All Steps Filled"
  args={{
    steps: [
      { name: 'Contact Details', testId: 'contact', anyFilled: true, allFilled: true },
      { name: 'Address', testId: 'address', anyFilled: true, allFilled: true },
      { name: 'Time Slots', testId: 'time-slots', anyFilled: true, allFilled: true },
      { name: 'Children', testId: 'children', anyFilled: true, allFilled: true },
      { name: 'Summary', testId: 'summary', anyFilled: false, allFilled: false },
    ],
    currentStep: 4,
    canJumpToAnyStep: true,
  }}
/>
