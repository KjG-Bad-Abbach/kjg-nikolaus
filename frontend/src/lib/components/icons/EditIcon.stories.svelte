<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import EditIcon from './EditIcon.svelte';

  const { Story } = defineMeta({
    component: EditIcon,
    title: 'Components/Icons/EditIcon',
    tags: ['autodocs'],
  });
</script>

<Story name="Default" args={{}} />

<Story name="Large" args={{ sizeClass: 'size-12' }} />

<Story name="Small" args={{ sizeClass: 'size-4' }} />

<Story name="With Custom Color">
  <div class="text-atlantis">
    <EditIcon />
  </div>
</Story>
