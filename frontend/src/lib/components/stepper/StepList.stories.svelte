<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import StepList from './StepList.svelte';
  import type { Props } from './StepList.svelte';

  const mockSteps: Props['steps'] = [
    { name: 'Contact Details', testId: 'contact', anyFilled: true, allFilled: true },
    { name: 'Address', testId: 'address', anyFilled: true, allFilled: false },
    { name: 'Time Slots', testId: 'time-slots', anyFilled: false, allFilled: false },
    { name: 'Children', testId: 'children', anyFilled: false, allFilled: false },
    { name: 'Summary', testId: 'summary', anyFilled: false, allFilled: false },
  ];

  const { Story } = defineMeta({
    component: StepList,
    title: 'Components/Stepper/StepList',
    tags: ['autodocs'],
    argTypes: {
      steps: { control: 'object' },
      currentStep: { control: 'number' },
      canJumpToAnyStep: { control: 'boolean' },
    },
    args: {
      steps: mockSteps,
      onStepClick: fn(),
    },
  });
</script>

<Story
  name="Playground"
  args={{
    currentStep: 2,
    canJumpToAnyStep: true,
  }}
/>

<Story
  name="First Step Active"
  args={{
    currentStep: 0,
    canJumpToAnyStep: false,
  }}
/>

<Story
  name="Second Step Active"
  args={{
    currentStep: 1,
    canJumpToAnyStep: false,
  }}
/>

<Story
  name="Last Step Active"
  args={{
    currentStep: 4,
    canJumpToAnyStep: false,
  }}
/>

<Story
  name="Can Jump To Any Step"
  args={{
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

<Story
  name="Empty Steps Array"
  args={{
    steps: [],
    currentStep: 0,
    canJumpToAnyStep: false,
  }}
/>

<Story
  name="Single Step"
  args={{
    steps: [{ name: 'Single Step', testId: 'single', anyFilled: false, allFilled: false }],
    currentStep: 0,
    canJumpToAnyStep: false,
  }}
/>

<Story
  name="Two Steps (Minimum Multi-step)"
  args={{
    steps: [
      { name: 'First', testId: 'first', anyFilled: true, allFilled: true },
      { name: 'Second', testId: 'second', anyFilled: false, allFilled: false },
    ],
    currentStep: 1,
    canJumpToAnyStep: true,
  }}
/>

<Story
  name="Many Steps (7)"
  args={{
    steps: [
      { name: 'Step 1', testId: 'step-1', anyFilled: true, allFilled: true },
      { name: 'Step 2', testId: 'step-2', anyFilled: true, allFilled: true },
      { name: 'Step 3', testId: 'step-3', anyFilled: true, allFilled: false },
      { name: 'Step 4', testId: 'step-4', anyFilled: false, allFilled: false },
      { name: 'Step 5', testId: 'step-5', anyFilled: false, allFilled: false },
      { name: 'Step 6', testId: 'step-6', anyFilled: false, allFilled: false },
      { name: 'Step 7', testId: 'step-7', anyFilled: false, allFilled: false },
    ],
    currentStep: 2,
    canJumpToAnyStep: false,
  }}
/>

<Story
  name="Very Long Step Names"
  args={{
    steps: [
      {
        name: 'This is a Very Long Step Name That Should Be Truncated',
        testId: 'long-1',
        anyFilled: true,
        allFilled: true,
      },
      {
        name: 'Another Extremely Long Step Name to Test Responsiveness',
        testId: 'long-2',
        anyFilled: false,
        allFilled: false,
      },
      {
        name: 'Short',
        testId: 'short',
        anyFilled: false,
        allFilled: false,
      },
    ],
    currentStep: 1,
    canJumpToAnyStep: true,
  }}
/>
