<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import EditIcon from './EditIcon.svelte';
  import type { Props } from './EditIcon.svelte';

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

<Story name="Default" />

<Story name="Extra Small" args={{ sizeClass: 'size-4' }} />

<Story name="Small" args={{ sizeClass: 'size-5' }} />

<Story name="Medium" args={{ sizeClass: 'size-6' }} />

<Story name="Large" args={{ sizeClass: 'size-10' }} />

<Story name="Extra Large" args={{ sizeClass: 'size-16' }} />

<Story name="With Custom Color" args={{ sizeClass: 'size-8' }}>
  {#snippet template(args: Props)}
    <div class="text-atlantis">
      <EditIcon {...args} />
    </div>
  {/snippet}
</Story>

<Story name="In Icon Button" args={{ sizeClass: 'size-5' }}>
  {#snippet template(args: Props)}
    <button
      class="inline-flex size-8 items-center justify-center rounded-sm hover:bg-gray-100"
      title="Edit"
    >
      <EditIcon {...args} />
    </button>
  {/snippet}
</Story>

<Story name="In Action Button" args={{ sizeClass: 'size-5' }}>
  {#snippet template(args: Props)}
    <button
      class="inline-flex items-center gap-2 rounded-sm border border-gray-300 px-3 py-2 hover:bg-gray-50"
    >
      <EditIcon {...args} />
      <span>Edit Profile</span>
    </button>
  {/snippet}
</Story>

<Story name="In Table Row" args={{ sizeClass: 'size-5' }}>
  {#snippet template(args: Props)}
    <div class="flex items-center justify-between rounded-sm border border-gray-300 p-3">
      <div>
        <div class="font-medium">John Doe</div>
        <div class="text-sm text-gray-500">john.doe@example.com</div>
      </div>
      <button class="text-gray-400 hover:text-gray-600">
        <EditIcon {...args} />
      </button>
    </div>
  {/snippet}
</Story>
