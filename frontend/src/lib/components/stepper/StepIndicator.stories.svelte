<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import StepIndicator from './StepIndicator.svelte';

  const { Story } = defineMeta({
    component: StepIndicator,
    title: 'Components/Stepper/StepIndicator',
    tags: ['autodocs'],
    argTypes: {
      index: { control: 'number' },
      name: { control: 'text' },
      testId: { control: 'text' },
      isCurrent: { control: 'boolean' },
      allFilled: { control: 'boolean' },
      canJumpTo: { control: 'boolean' },
    },
  });
</script>

<Story
  name="Playground"
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
  name="Filled But Cannot Jump"
  args={{
    index: 2,
    name: 'Time Slots',
    testId: 'time-slots',
    isCurrent: false,
    allFilled: true,
    canJumpTo: false,
  }}
/>

<!-- Demo showing all states in sequence -->
<Story name="All States Comparison">
  <div class="space-y-4 p-4">
    <div class="flex items-center gap-4">
      <StepIndicator
        index={0}
        name="Not Filled"
        testId="not-filled"
        isCurrent={false}
        allFilled={false}
        canJumpTo={false}
      />
      <StepIndicator
        index={1}
        name="Current"
        testId="current"
        isCurrent={true}
        allFilled={false}
        canJumpTo={true}
      />
      <StepIndicator
        index={2}
        name="Filled"
        testId="filled"
        isCurrent={false}
        allFilled={true}
        canJumpTo={true}
      />
      <StepIndicator
        index={3}
        name="Current + Filled"
        testId="current-filled"
        isCurrent={true}
        allFilled={true}
        canJumpTo={true}
      />
      <StepIndicator
        index={4}
        name="Filled (No Jump)"
        testId="filled-no-jump"
        isCurrent={false}
        allFilled={true}
        canJumpTo={false}
      />
    </div>
  </div>
</Story>
