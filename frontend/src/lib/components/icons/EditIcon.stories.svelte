<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import EditIcon from './EditIcon.svelte';

  const { Story } = defineMeta({
    component: EditIcon,
    title: 'Components/Icons/EditIcon',
    tags: ['autodocs'],
    argTypes: {
      sizeClass: {
        control: 'select',
        options: ['size-4', 'size-5', 'size-6', 'size-8', 'size-10', 'size-12', 'size-16'],
        description: 'Tailwind size class for the icon',
      },
    },
  });
</script>

<Story name="Playground" args={{ sizeClass: 'size-6' }} />

<Story name="Default" args={{}} />

<Story name="Extra Small" args={{ sizeClass: 'size-4' }} />

<Story name="Small" args={{ sizeClass: 'size-5' }} />

<Story name="Medium" args={{ sizeClass: 'size-6' }} />

<Story name="Large" args={{ sizeClass: 'size-10' }} />

<Story name="Extra Large" args={{ sizeClass: 'size-16' }} />

<Story name="With Custom Color">
  <div class="text-atlantis">
    <EditIcon sizeClass="size-8" />
  </div>
</Story>

<Story name="In Icon Button">
  <button
    class="inline-flex size-8 items-center justify-center rounded hover:bg-gray-100"
    title="Edit"
  >
    <EditIcon sizeClass="size-5" />
  </button>
</Story>

<Story name="In Action Button">
  <button
    class="inline-flex items-center gap-2 rounded border border-gray-300 px-3 py-2 hover:bg-gray-50"
  >
    <EditIcon sizeClass="size-5" />
    <span>Edit Profile</span>
  </button>
</Story>

<Story name="In Table Row">
  <div class="flex items-center justify-between rounded border border-gray-300 p-3">
    <div>
      <div class="font-medium">John Doe</div>
      <div class="text-sm text-gray-500">john.doe@example.com</div>
    </div>
    <button class="text-gray-400 hover:text-gray-600">
      <EditIcon sizeClass="size-5" />
    </button>
  </div>
</Story>
