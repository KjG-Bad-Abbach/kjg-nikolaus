<script lang="ts" module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { fn } from 'storybook/test';
  import ErrorModal from './ErrorModal.svelte';
  import type { Props } from './ErrorModal.svelte';

  const simpleError = {
    message: 'Something went wrong. Please try again.',
  };

  const detailedError = {
    message: 'Failed to submit booking',
    status: { code: 500, text: 'Internal Server Error' },
    body: {
      error: 'Database connection failed',
      details: 'Connection timeout after 30s',
    },
  };

  const validationError = {
    message: 'Validation failed',
    status: { code: 400, text: 'Bad Request' },
    body: {
      error: {
        name: 'ValidationError',
        details: {
          email: 'Invalid email format',
          phone: 'Phone number is required',
        },
      },
    },
  };

  const { Story } = defineMeta({
    component: ErrorModal,
    title: 'Components/ErrorModal',
    tags: ['autodocs'],
    parameters: {
      layout: 'fullscreen',
    },
    args: {
      error: detailedError,
      onClose: fn(),
      onRetry: fn(),
      askToReload: false,
    },
  });
</script>

{#snippet template(args: Props)}
  <div class="min-h-96 w-full space-y-4 bg-gray-100 p-4">
    <h1 class="mb-4 text-2xl font-bold">Background Content</h1>
    <p>This content is behind the ErrorModal to demonstrate the backdrop effect.</p>
    <p>
      Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
      invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et
      justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem
      ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
      eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos
      et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata
      sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing
      elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed
      diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
      gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
    </p>
    <p>
      Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel
      illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui
      blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem
      ipsum dolor sit amet, consectetuer
    </p>
  </div>
  <ErrorModal {...args} />
{/snippet}

<Story name="Simple Error" args={{ error: simpleError }} {template} />

<Story name="Detailed Error" {template} />

<Story name="Validation Error" args={{ error: validationError }} {template} />

<Story name="With Retry Button" args={{ askToReload: true }} {template} />

<Story name="No Error" args={{ error: null }} {template} />
