<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ErrorModal from './ErrorModal.svelte';

  const { Story } = defineMeta({
    component: ErrorModal,
    title: 'Components/ErrorModal',
    tags: ['autodocs'],
  });

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
</script>

<Story name="Simple Error" args={{ error: simpleError, onClose: () => {}, askToReload: false }} />

<Story
  name="Detailed Error"
  args={{ error: detailedError, onClose: () => {}, askToReload: false }}
/>

<Story
  name="Validation Error"
  args={{ error: validationError, onClose: () => {}, askToReload: false }}
/>

<Story
  name="With Retry Button"
  args={{ error: detailedError, onClose: () => {}, onRetry: () => {}, askToReload: true }}
/>

<Story name="No Error" args={{ error: null, onClose: () => {}, askToReload: false }} />
