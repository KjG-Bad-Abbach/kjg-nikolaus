<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import CheckIcon from './CheckIcon.svelte';

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
    },
  });
</script>

<Story name="Playground" args={{ sizeClass: 'size-4' }} />

<Story name="Default" args={{}} />

<Story name="Extra Small" args={{ sizeClass: 'size-3' }} />

<Story name="Small" args={{ sizeClass: 'size-4' }} />

<Story name="Medium" args={{ sizeClass: 'size-6' }} />

<Story name="Large" args={{ sizeClass: 'size-12' }} />

<Story name="Extra Large" args={{ sizeClass: 'size-16' }} />

<Story name="With Custom Color">
  <div class="text-atlantis">
    <CheckIcon sizeClass="size-8" />
  </div>
</Story>

<Story name="In Success Badge">
  <div class="inline-flex items-center gap-1 rounded-full bg-atlantis px-3 py-1 text-sm text-white">
    <CheckIcon sizeClass="size-4" />
    <span>Verified</span>
  </div>
</Story>

<Story name="In Step Indicator">
  <div class="flex size-8 items-center justify-center rounded-full bg-calypso text-white">
    <CheckIcon />
  </div>
</Story>
