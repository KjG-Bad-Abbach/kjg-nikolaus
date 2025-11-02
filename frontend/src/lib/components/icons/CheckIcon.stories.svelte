<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import CheckIcon from './CheckIcon.svelte';

  const { Story } = defineMeta({
    component: CheckIcon,
    title: 'Components/Icons/CheckIcon',
    tags: ['autodocs'],
  });
</script>

<Story name="Default" args={{}} />

<Story name="Large" args={{ sizeClass: 'size-12' }} />

<Story name="Small" args={{ sizeClass: 'size-3' }} />

<Story name="In Step Indicator">
  <div class="flex size-8 items-center justify-center rounded-full bg-calypso text-calypso-500">
    <CheckIcon />
  </div>
</Story>
