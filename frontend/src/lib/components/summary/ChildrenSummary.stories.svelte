<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import ChildrenSummary from './ChildrenSummary.svelte';
  import type { Props } from './ChildrenSummary.svelte';

  const finalDeadline = new Date('2024-12-10T19:30:00+01:00');

  const completeChildren: Props['children'] = [
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

  const incompleteChildren: Props['children'] = [
    {
      id: '1',
      name: 'Max',
      identification_trait: '',
      speech: 'Max war dieses Jahr besonders fleißig',
    },
  ];

  const manyChildren: Props['children'] = [
    ...completeChildren,
    {
      id: '3',
      name: 'Sophie',
      identification_trait: 'Rotes Kleid',
      speech: 'Sophie hat allen Kindern geholfen',
    },
    {
      id: '4',
      name: 'Leon',
      identification_trait: 'Blaue Mütze',
      speech: 'Leon hat fleißig Klavier geübt',
    },
    {
      id: '5',
      name: 'Hannah',
      identification_trait: 'Zopf',
      speech: 'Hannah war sehr hilfsbereit',
    },
  ];

  const childWithLongSpeech: Props['children'] = [
    {
      id: '1',
      name: 'Max',
      identification_trait: 'Blaue Augen',
      speech:
        'Max war dieses Jahr besonders fleißig und hat seinen Eltern und Geschwistern geholfen. Er hat seine Hausaufgaben immer pünktlich erledigt und war sehr ordentlich. Außerdem hat er sich um seine kleinere Schwester gekümmert und war ein Vorbild für alle anderen Kinder.',
    },
  ];

  const { Story } = defineMeta({
    component: ChildrenSummary,
    title: 'Components/Summary/ChildrenSummary',
    tags: ['autodocs'],
    argTypes: {
      onEdit: { action: 'edit' },
      children: { control: 'object' },
      additionalNotes: { control: 'text' },
      finalDeadline: { control: 'date' },
    },
    args: {
      children: completeChildren,
      additionalNotes: '',
      finalDeadline,
      onEdit: fn(),
    },
  });
</script>

<Story name="Playground" />

<Story name="Two Children Complete" />

<Story
  name="With Additional Notes"
  args={{
    additionalNotes: 'Bitte klingeln Sie zweimal. Die Kinder warten schon gespannt!',
  }}
/>

<Story
  name="With Long Additional Notes"
  args={{
    additionalNotes:
      'Bitte klingeln Sie zweimal und warten Sie kurz. Die Kinder sind sehr aufgeregt und werden zur Tür rennen. Der Hund sollte weggesperrt sein, aber bitte vorsichtig sein. Die Geschenke sollten unter dem Weihnachtsbaum im Wohnzimmer abgelegt werden.',
  }}
/>

<Story
  name="Child with Missing Fields"
  args={{
    children: incompleteChildren,
  }}
/>

<Story
  name="No Children (Empty List)"
  args={{
    children: [],
  }}
/>

<Story
  name="Single Child"
  args={{
    children: [completeChildren[0]],
  }}
/>

<Story
  name="Many Children (5 Children)"
  args={{
    children: manyChildren,
  }}
/>

<Story
  name="Child with Long Speech (Truncation Test)"
  args={{
    children: childWithLongSpeech,
  }}
/>

<Story
  name="Many Children with Notes"
  args={{
    children: manyChildren,
    additionalNotes: 'Alle Kinder sind sehr aufgeregt. Bitte um 18:00 Uhr kommen.',
  }}
/>
