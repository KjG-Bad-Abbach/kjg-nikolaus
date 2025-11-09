<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import CheckIcon from './CheckIcon.svelte';
  import type { Props } from './CheckIcon.svelte';

  const { Story } = defineMeta({
    component: CheckIcon,
    title: 'Components/Icons/CheckIcon',
    tags: ['autodocs'],
    argTypes: {
      sizeClass: {
        control: 'select',
        options: [
          'size-3',
          'size-4',
          'size-5',
          'size-6',
          'size-8',
          'size-10',
          'size-12',
          'size-16',
        ],
        description: 'Tailwind size class for the icon',
      },
      colorClass: {
        control: 'select',
        options: [
          'text-java',
          'text-calypso',
          'text-flush-orange',
          'text-camelot',
          'text-brink-pink',
          'text-bossanova',
          'text-atlantis',
          'text-surfie-green',
          'text-sun',
          'text-rust',
        ],
        description: 'Tailwind color class for the icon',
      },
      class: { control: 'text', description: 'Additional classes for the icon' },
    },
  });
</script>

<Story name="Playground" />

<Story name="Default" />

<Story name="Extra Small" args={{ sizeClass: 'size-3' }} />

<Story name="Small" args={{ sizeClass: 'size-4' }} />

<Story name="Medium" />

<Story name="Large" args={{ sizeClass: 'size-12' }} />

<Story name="Extra Large" args={{ sizeClass: 'size-16' }} />

<Story name="With Color" args={{ colorClass: 'text-atlantis' }} />

<Story name="In Success Badge">
  {#snippet template(args: Props)}
    <div
      class="inline-flex items-center gap-1 rounded-full bg-atlantis px-3 py-1 text-sm text-white"
    >
      <CheckIcon {...args} />
      <span>Verified</span>
    </div>
  {/snippet}
</Story>

<Story name="In Step Indicator">
  {#snippet template(args: Props)}
    <div class="flex size-8 items-center justify-center rounded-full bg-calypso text-white">
      <CheckIcon {...args} />
    </div>
  {/snippet}
</Story>
