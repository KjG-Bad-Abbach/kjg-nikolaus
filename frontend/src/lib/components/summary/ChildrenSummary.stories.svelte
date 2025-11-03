<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ChildrenSummary from './ChildrenSummary.svelte';

  const { Story } = defineMeta({
    component: ChildrenSummary,
    title: 'Components/Summary/ChildrenSummary',
    tags: ['autodocs'],
    argTypes: {
      onEdit: { action: 'edit' },
    },
  });

  const finalDeadline = new Date('2024-12-10T19:30:00+01:00');

  const completeChildren = [
    {
      id: '1',
      name: 'Max',
      identification_trait: 'Blaue Augen',
      speech: 'Max war dieses Jahr besonders fleißig',
    },
    {
      id: '2',
      name: 'Emma',
      identification_trait: 'Blonde Haare',
      speech: 'Emma hat immer ihre Hausaufgaben gemacht',
    },
  ];

  const incompleteChildren = [
    {
      id: '1',
      name: 'Max',
      identification_trait: '',
      speech: 'Max war dieses Jahr besonders fleißig',
    },
  ];
</script>

<Story
  name="Complete"
  args={{
    children: completeChildren,
    additionalNotes: '',
    finalDeadline,
  }}
/>

<Story
  name="With Additional Notes"
  args={{
    children: completeChildren,
    additionalNotes: 'Bitte klingeln Sie zweimal. Die Kinder warten schon gespannt!',
    finalDeadline,
  }}
/>

<Story
  name="Incomplete"
  args={{
    children: incompleteChildren,
    additionalNotes: '',
    finalDeadline,
  }}
/>

<Story
  name="Empty"
  args={{
    children: [],
    additionalNotes: '',
    finalDeadline,
  }}
/>

<Story
  name="Single Child"
  args={{
    children: [completeChildren[0]],
    additionalNotes: '',
    finalDeadline,
  }}
/>
