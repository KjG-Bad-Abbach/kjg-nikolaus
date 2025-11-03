<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import SummaryStep from './SummaryStep.svelte';

  const { Story } = defineMeta({
    component: SummaryStep,
    title: 'Components/Steps/SummaryStep',
    tags: ['autodocs'],
    argTypes: {
      isRoutePlanningFilled: { control: 'boolean' },
      isEverythingFilled: { control: 'boolean' },
    },
  });
</script>

<Story
  name="Nothing Complete"
  args={{
    isRoutePlanningFilled: false,
    isEverythingFilled: false,
    routePlanningDeadline: new Date('2024-12-01T19:30:00+01:00'),
    finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
  }}
/>

<Story
  name="Route Planning Complete"
  args={{
    isRoutePlanningFilled: true,
    isEverythingFilled: false,
    routePlanningDeadline: new Date('2024-12-01T19:30:00+01:00'),
    finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
  }}
/>

<Story
  name="Everything Complete"
  args={{
    isRoutePlanningFilled: true,
    isEverythingFilled: true,
    routePlanningDeadline: new Date('2024-12-01T19:30:00+01:00'),
    finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
  }}
/>
