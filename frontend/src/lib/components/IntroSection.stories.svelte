<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import IntroSection from './IntroSection.svelte';
  import type { Props } from './IntroSection.svelte';

  // Sample introduction text with various formatting
  const sampleIntroText: Props['introductionText'] = [
    {
      type: 'heading',
      level: 2,
      children: [{ type: 'text', text: 'Willkommen zur Nikolaus-Buchung' }],
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          text: 'Hier können Sie einen Termin für den Nikolausbesuch bei Ihnen zu Hause buchen.',
        },
      ],
    },
    {
      type: 'heading',
      level: 3,
      children: [{ type: 'text', text: 'Wichtige Informationen' }],
    },
    {
      type: 'list',
      format: 'unordered',
      children: [
        {
          type: 'list-item',
          children: [{ type: 'text', text: 'Bitte füllen Sie alle Felder aus' }],
        },
        {
          type: 'list-item',
          children: [{ type: 'text', text: 'Beachten Sie die Deadlines' }],
        },
        {
          type: 'list-item',
          children: [{ type: 'text', text: 'Sie erhalten eine Bestätigungs-E-Mail' }],
        },
      ],
    },
    {
      type: 'paragraph',
      children: [
        { type: 'text', text: 'Bei Fragen wenden Sie sich bitte an ' },
        {
          type: 'link',
          url: 'mailto:info@example.com',
          children: [{ type: 'text', text: 'info@example.com' }],
        },
        { type: 'text', text: '.' },
      ],
    },
  ];

  const shortIntroText: Props['introductionText'] = [
    {
      type: 'paragraph',
      children: [{ type: 'text', text: 'Kurze Einführung für die Buchung.' }],
    },
  ];

  const richFormattingText: Props['introductionText'] = [
    {
      type: 'paragraph',
      children: [
        { type: 'text', text: 'Dies ist ' },
        { type: 'text', text: 'fett', bold: true },
        { type: 'text', text: ', ' },
        { type: 'text', text: 'kursiv', italic: true },
        { type: 'text', text: ' und ' },
        { type: 'text', text: 'unterstrichen', underline: true },
        { type: 'text', text: '.' },
      ],
    },
  ];

  const { Story } = defineMeta({
    component: IntroSection,
    title: 'Components/IntroSection',
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
    },
    args: {
      introductionText: sampleIntroText,
      onStart: fn(),
    },
  });
</script>

{#snippet template(args: Props)}
  <div class="bg-java p-4">
    <IntroSection {...args} />
  </div>
{/snippet}

<Story name="Default" {template} />

<Story
  name="Short Text"
  args={{
    introductionText: shortIntroText,
  }}
  {template}
/>

<Story
  name="Rich Formatting"
  args={{
    introductionText: richFormattingText,
  }}
  {template}
/>

<Story
  name="Empty Text"
  args={{
    introductionText: [],
  }}
  {template}
/>

<Story
  name="Realistic Example"
  args={{
    introductionText: [
      {
        type: 'heading',
        level: 1,
        children: [{ type: 'text', text: 'Nikolaus-Buchung 2024' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            type: 'text',
            text: 'Willkommen auf unserer Buchungsplattform! Hier können Sie einen Hausbesuch vom Nikolaus für Ihre Familie buchen.',
          },
        ],
      },
      {
        type: 'heading',
        level: 3,
        children: [{ type: 'text', text: 'So funktioniert es:' }],
      },
      {
        type: 'list',
        format: 'ordered',
        children: [
          {
            type: 'list-item',
            children: [{ type: 'text', text: 'Füllen Sie das Formular aus' }],
          },
          {
            type: 'list-item',
            children: [{ type: 'text', text: 'Wählen Sie bis zu 3 Wunschtermine' }],
          },
          {
            type: 'list-item',
            children: [{ type: 'text', text: 'Wir weisen Ihnen einen Termin zu' }],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [
          { type: 'text', text: 'Weitere Informationen finden Sie in unserer ' },
          {
            type: 'link',
            url: '#',
            children: [{ type: 'text', text: 'FAQ' }],
          },
          { type: 'text', text: '.' },
        ],
      },
    ],
  }}
  {template}
/>
