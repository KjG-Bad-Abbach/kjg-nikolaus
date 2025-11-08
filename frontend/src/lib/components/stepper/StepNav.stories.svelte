<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import StepNav from './StepNav.svelte';
  import StepList from './StepList.svelte';

  const { Story } = defineMeta({
    component: StepNav,
    title: 'Components/Stepper/StepNav',
    tags: ['autodocs'],
    argTypes: {
      currentStep: { control: 'number' },
      totalSteps: { control: 'number' },
      canJumpToAnyStep: { control: 'boolean' },
    },
  });

  const mockSteps = [
    { name: 'Contact', testId: 'contact', anyFilled: true, allFilled: true },
    { name: 'Address', testId: 'address', anyFilled: true, allFilled: false },
    { name: 'Time Slots', testId: 'time-slots', anyFilled: false, allFilled: false },
    { name: 'Children', testId: 'children', anyFilled: false, allFilled: false },
    { name: 'Summary', testId: 'summary', anyFilled: false, allFilled: false },
  ];
</script>

{#snippet stepListContent()}
  <StepList steps={mockSteps} currentStep={2} canJumpToAnyStep={true} />
{/snippet}

<Story
  name="Playground"
  args={{
    currentStep: 2,
    totalSteps: 5,
    canJumpToAnyStep: true,
    children: stepListContent,
  }}
/>

<!-- Demo showing complete stepper with navigation -->
<Story name="First Step">
  <StepNav currentStep={0} totalSteps={5} canJumpToAnyStep={true}>
    <StepList steps={mockSteps} currentStep={0} canJumpToAnyStep={true} />
  </StepNav>
</Story>

<Story name="Middle Step">
  <StepNav currentStep={2} totalSteps={5} canJumpToAnyStep={true}>
    <StepList steps={mockSteps} currentStep={2} canJumpToAnyStep={true} />
  </StepNav>
</Story>

<Story name="Last Step">
  <StepNav currentStep={4} totalSteps={5} canJumpToAnyStep={true}>
    <StepList steps={mockSteps} currentStep={4} canJumpToAnyStep={true} />
  </StepNav>
</Story>

<Story name="Cannot Jump (Buttons Hidden)">
  <StepNav currentStep={2} totalSteps={5} canJumpToAnyStep={false}>
    <StepList steps={mockSteps} currentStep={2} canJumpToAnyStep={false} />
  </StepNav>
</Story>

<Story name="Single Step (Both Buttons Disabled)">
  <StepNav currentStep={0} totalSteps={1} canJumpToAnyStep={true}>
    <StepList
      steps={[{ name: 'Only Step', testId: 'only', anyFilled: true, allFilled: true }]}
      currentStep={0}
      canJumpToAnyStep={true}
    />
  </StepNav>
</Story>

<Story name="Two Steps (Minimum Multi-step)">
  <StepNav currentStep={0} totalSteps={2} canJumpToAnyStep={true}>
    <StepList
      steps={[
        { name: 'First', testId: 'first', anyFilled: true, allFilled: true },
        { name: 'Second', testId: 'second', anyFilled: false, allFilled: false },
      ]}
      currentStep={0}
      canJumpToAnyStep={true}
    />
  </StepNav>
</Story>

<Story name="Without Children Slot (Standalone Buttons)">
  <StepNav currentStep={2} totalSteps={5} canJumpToAnyStep={true} />
</Story>

<!-- Demo showing all states -->
<Story name="All States Comparison">
  <div class="space-y-8 p-4">
    <div>
      <h3 class="mb-2 text-sm font-bold">First Step (Previous Disabled)</h3>
      <StepNav currentStep={0} totalSteps={5} canJumpToAnyStep={true}>
        <StepList steps={mockSteps} currentStep={0} canJumpToAnyStep={true} />
      </StepNav>
    </div>
    <div>
      <h3 class="mb-2 text-sm font-bold">Middle Step (Both Enabled)</h3>
      <StepNav currentStep={2} totalSteps={5} canJumpToAnyStep={true}>
        <StepList steps={mockSteps} currentStep={2} canJumpToAnyStep={true} />
      </StepNav>
    </div>
    <div>
      <h3 class="mb-2 text-sm font-bold">Last Step (Next Disabled)</h3>
      <StepNav currentStep={4} totalSteps={5} canJumpToAnyStep={true}>
        <StepList steps={mockSteps} currentStep={4} canJumpToAnyStep={true} />
      </StepNav>
    </div>
    <div>
      <h3 class="mb-2 text-sm font-bold">Cannot Jump (Buttons Hidden)</h3>
      <StepNav currentStep={2} totalSteps={5} canJumpToAnyStep={false}>
        <StepList steps={mockSteps} currentStep={2} canJumpToAnyStep={false} />
      </StepNav>
    </div>
    <div>
      <h3 class="mb-2 text-sm font-bold">Single Step (Both Disabled)</h3>
      <StepNav currentStep={0} totalSteps={1} canJumpToAnyStep={true}>
        <StepList
          steps={[{ name: 'Only Step', testId: 'only', anyFilled: true, allFilled: true }]}
          currentStep={0}
          canJumpToAnyStep={true}
        />
      </StepNav>
    </div>
  </div>
</Story>
