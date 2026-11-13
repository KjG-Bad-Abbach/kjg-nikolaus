<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import StepNav from './StepNav.svelte';
  import StepList from './StepList.svelte';
  import type { Props } from './StepNav.svelte';
  import type { Props as StepListProps } from './StepList.svelte';

  const mockSteps = [
    { name: 'Contact', testId: 'contact', anyFilled: true, allFilled: true },
    { name: 'Address', testId: 'address', anyFilled: true, allFilled: false },
    { name: 'Time Slots', testId: 'time-slots', anyFilled: false, allFilled: false },
    { name: 'Children', testId: 'children', anyFilled: false, allFilled: false },
    { name: 'Summary', testId: 'summary', anyFilled: false, allFilled: false },
  ];

  const { Story } = defineMeta({
    component: StepNav,
    title: 'Components/Stepper/StepNav',
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
    },
    argTypes: {
      currentStep: { control: 'number' },
      totalSteps: { control: 'number' },
      canJumpToAnyStep: { control: 'boolean' },
    },
    args: {
      currentStep: 0,
      totalSteps: 5,
      canJumpToAnyStep: true,
      onPrevious: fn(),
      onNext: fn(),
    },
  });
</script>

{#snippet template(args: Props)}
  {@render templateWithSteps(args)}
{/snippet}

{#snippet templateWithSteps(args: Props, steps: StepListProps['steps'] = mockSteps)}
  <div class="bg-java p-4">
    <StepNav {...args}>
      <StepList {steps} currentStep={args.currentStep} canJumpToAnyStep={args.canJumpToAnyStep} />
    </StepNav>
  </div>
{/snippet}

<Story name="First Step" {template} />

<Story name="Middle Step" args={{ currentStep: 2 }} {template} />

<Story name="Last Step" args={{ currentStep: 4 }} {template} />

<Story
  name="Cannot Jump (Buttons Hidden)"
  args={{ currentStep: 2, canJumpToAnyStep: false }}
  {template}
/>

{#snippet templateOneStep(args: Props)}
  {@render templateWithSteps(args, [
    { name: 'Only Step', testId: 'only', anyFilled: true, allFilled: true },
  ])}
{/snippet}

<Story
  name="Single Step (Both Buttons Disabled)"
  args={{ totalSteps: 1 }}
  template={templateOneStep}
/>

{#snippet templateTwoSteps(args: Props)}
  {@render templateWithSteps(args, [
    { name: 'First', testId: 'first', anyFilled: true, allFilled: true },
    { name: 'Second', testId: 'second', anyFilled: false, allFilled: false },
  ])}
{/snippet}

<Story name="Two Steps (Minimum Multi-step)" args={{ totalSteps: 2 }} template={templateTwoSteps} />

{#snippet templateWithoutSteps(args: Props)}
  <div class="bg-java p-4">
    <StepNav {...args} />
  </div>
{/snippet}

<Story name="Without Children Slot (Standalone Buttons)" template={templateWithoutSteps} />

<!-- Demo showing all states -->
<Story name="All States Comparison">
  {#snippet template(args: Props)}
    <div class="space-y-8 bg-java p-4">
      <div>
        <h3 class="mb-2 text-sm font-bold">First Step (Previous Disabled)</h3>
        <StepNav {...args} currentStep={0} totalSteps={5}>
          <StepList steps={mockSteps} currentStep={0} canJumpToAnyStep={args.canJumpToAnyStep} />
        </StepNav>
      </div>
      <div>
        <h3 class="mb-2 text-sm font-bold">Middle Step (Both Enabled)</h3>
        <StepNav {...args} currentStep={2} totalSteps={5}>
          <StepList steps={mockSteps} currentStep={2} canJumpToAnyStep={args.canJumpToAnyStep} />
        </StepNav>
      </div>
      <div>
        <h3 class="mb-2 text-sm font-bold">Last Step (Next Disabled)</h3>
        <StepNav {...args} currentStep={4} totalSteps={5}>
          <StepList steps={mockSteps} currentStep={4} canJumpToAnyStep={args.canJumpToAnyStep} />
        </StepNav>
      </div>
      <div>
        <h3 class="mb-2 text-sm font-bold">Cannot Jump (Buttons Hidden)</h3>
        <StepNav {...args} currentStep={2} totalSteps={5}>
          <StepList steps={mockSteps} currentStep={2} canJumpToAnyStep={args.canJumpToAnyStep} />
        </StepNav>
      </div>
      <div>
        <h3 class="mb-2 text-sm font-bold">Single Step (Both Disabled)</h3>
        <StepNav {...args} currentStep={0} totalSteps={1}>
          <StepList
            steps={[{ name: 'Only Step', testId: 'only', anyFilled: true, allFilled: true }]}
            currentStep={0}
            canJumpToAnyStep={args.canJumpToAnyStep}
          />
        </StepNav>
      </div>
    </div>
  {/snippet}
</Story>
