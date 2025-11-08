<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ChildrenStep from './ChildrenStep.svelte';

  const { Story } = defineMeta({
    component: ChildrenStep,
    title: 'Components/Steps/ChildrenStep',
    tags: ['autodocs'],
    argTypes: {
      additionalNotes: {
        control: 'text',
        description: 'Additional notes for the visit',
      },
      canEditAnything: {
        control: 'boolean',
        description: 'Whether any editing is allowed',
      },
    },
  });
</script>

<Story
  name="Playground"
  args={{
    children: [
      {
        name: 'Max',
        identification_trait: '8 Jahre, dunkle Haare',
        speech: 'kann toll zeichnen\närgert seine Schwester oft',
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
  name="Empty (No Children)"
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

<Story
  name="With Validation Errors"
  args={{
    children: [
      {
        name: '',
        identification_trait: '',
        speech: '',
      },
    ],
    additionalNotes: '',
    finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
    canEditAnything: true,
    validationMessages: {
      'booking.children[0].name': ['Name ist erforderlich'],
    },
    onChange: () => {},
    onSubmit: () => {},
  }}
/>

<Story
  name="With Many Children (5)"
  args={{
    children: [
      {
        name: 'Lukas',
        identification_trait: '10 Jahre, ältestes Kind, Brille',
        speech: 'sehr fleißig in der Schule\nmuss öfter mit Geschwistern teilen',
      },
      {
        name: 'Emma',
        identification_trait: '8 Jahre, blonde Zöpfe',
        speech: 'hilft toll im Haushalt\nZimmer aufräumen vergessen',
      },
      {
        name: 'Felix',
        identification_trait: '6 Jahre, rotes T-Shirt',
        speech: 'teilt gerne mit Geschwistern\nzu laut beim Spielen',
      },
      {
        name: 'Mia',
        identification_trait: '4 Jahre, kleinstes Mädchen',
        speech: 'sagt immer Bitte und Danke\nzu schüchtern',
      },
      {
        name: 'Ben',
        identification_trait: '3 Jahre, jüngstes Kind',
        speech: 'liebt Feuerwehr über alles\nstört beim Hausaufgaben machen',
      },
    ],
    additionalNotes:
      'Familie hat einen Hund, der bei Fremden bellt. Bitte Klingel nutzen und kurz warten.',
    finalDeadline: new Date('2024-12-05T19:30:00+01:00'),
    canEditAnything: true,
    validationMessages: {},
    onChange: () => {},
    onSubmit: () => {},
  }}
/>

<Story
  name="With Very Long Speech Text"
  args={{
    children: [
      {
        name: 'Maximilian',
        identification_trait:
          '9 Jahre alt, trägt eine Brille mit blauem Gestell, hat dunkelbraune lockige Haare und ist das größte Kind',
        speech:
          'Lieber Maximilian, du hast dieses Jahr wirklich viel geschafft! In der Schule bist du sehr fleißig und deine Lehrerin hat mir erzählt, dass du besonders gut im Rechnen bist. Du hilfst deiner Mutter oft beim Tischdecken und räumst dein Zimmer meistens ganz ordentlich auf. Besonders schön ist, dass du deinem kleinen Bruder beim Anziehen hilfst und ihm Geschichten vorliest.\n\nAber der Nikolaus hat auch gesehen, dass du manchmal vergisst, deine Hausaufgaben rechtzeitig zu machen, und dass du dich öfter mit deiner Schwester streitest, wenn ihr zusammen spielt. Im nächsten Jahr könntest du versuchen, geduldiger zu sein und besser auf deine Schwester aufzupassen.\n\nMach weiter so mit dem Lernen und dem Helfen, lieber Maximilian!',
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
