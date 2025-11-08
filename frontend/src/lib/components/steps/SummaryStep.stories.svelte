<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import SummaryStep from './SummaryStep.svelte';

  const { Story } = defineMeta({
    component: SummaryStep,
    title: 'Components/Steps/SummaryStep',
    tags: ['autodocs'],
    argTypes: {
      isRoutePlanningFilled: {
        control: 'boolean',
        description: 'Whether route planning information is complete',
      },
      isEverythingFilled: {
        control: 'boolean',
        description: 'Whether all information is complete',
      },
    },
    args: {
      isRoutePlanningFilled: true,
      isEverythingFilled: false,
      routePlanningDeadline: new Date('2024-12-01T19:30:00+01:00'),
      finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
    },
  });
</script>

<Story name="Playground" />

<Story
  name="Nothing Complete"
  args={{
    isRoutePlanningFilled: false,
  }}
/>

<Story name="Route Planning Complete" />

<Story
  name="Everything Complete"
  args={{
    isEverythingFilled: true,
  }}
/>
