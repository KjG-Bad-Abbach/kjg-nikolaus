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

<Story name="In Icon Button">
  {#snippet template(args: Props)}
    <button
      class="inline-flex size-8 items-center justify-center rounded-sm hover:bg-gray-100"
      title="Edit"
    >
      <EditIcon {...args} />
    </button>
  {/snippet}
</Story>

<Story name="In Action Button">
  {#snippet template(args: Props)}
    <button
      class="inline-flex items-center gap-2 rounded-sm border border-gray-300 px-3 py-2 hover:bg-gray-50"
    >
      <EditIcon {...args} />
      <span>Edit Profile</span>
    </button>
  {/snippet}
</Story>

<Story name="In Table Row">
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
