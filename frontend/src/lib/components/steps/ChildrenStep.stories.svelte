<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ChildrenStep from './ChildrenStep.svelte';

  const { Story } = defineMeta({
    component: ChildrenStep,
    title: 'Components/Steps/ChildrenStep',
    tags: ['autodocs'],
    argTypes: {
      canEditAnything: { control: 'boolean' },
    },
  });
</script>

<Story
  name="Default (Empty)"
  args={{
    children: [],
    additionalNotes: '',
    finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
    canEditAnything: true,
    validationMessages: {},
    onChange: () => {},
    onSubmit: () => {},
  }}
/>

<Story
  name="With One Child"
  args={{
    children: [
      {
        name: 'Max',
        identification_trait: '8 Jahre, dunkle Haare',
        speech: 'kann toll zeichnen\närgert seine Schwester oft',
      },
    ],
    additionalNotes: '',
    finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
    canEditAnything: true,
    validationMessages: {},
    onChange: () => {},
    onSubmit: () => {},
  }}
/>

<Story
  name="With Multiple Children"
  args={{
    children: [
      {
        name: 'Max',
        identification_trait: '8 Jahre, größtes Kind',
        speech: 'kann toll zeichnen, Kunst ist Lieblingsfach\närgert seine Schwester oft',
      },
      {
        name: 'Anna',
        identification_trait: '6 Jahre, lange blonde Haare',
        speech: 'sehr aufgewecktes Kind, freut sich auf Schule\nschreit sehr laut beim Streiten',
      },
    ],
    additionalNotes: 'Hund bellt, bitte Klingel benutzen',
    finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
    canEditAnything: true,
    validationMessages: {},
    onChange: () => {},
    onSubmit: () => {},
  }}
/>

<Story
  name="Read-only"
  args={{
    children: [
      {
        name: 'Max',
        identification_trait: '8 Jahre',
        speech: 'kann toll zeichnen',
      },
    ],
    additionalNotes: 'Hund im Garten',
    finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
    canEditAnything: false,
    validationMessages: {},
    onChange: () => {},
    onSubmit: () => {},
  }}
/>
