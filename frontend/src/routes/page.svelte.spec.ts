import { page } from 'vitest/browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import { SvelteDate } from 'svelte/reactivity';

// Mock the API client
vi.mock('$lib/api/client', () => ({
  sendRequest: vi.fn(),
}));

// Mock the unsaved changes utility
vi.mock('$lib/utils/unsavedChanges', () => ({
  registerCheckUnsavedChanges: vi.fn(),
}));

describe('/+page.svelte', () => {
  beforeEach(async () => {
    // Mock API responses for config
    const { sendRequest } = await import('$lib/api/client');
    vi.mocked(sendRequest).mockResolvedValue({
      data: {
        id: '1',
        documentId: 'config-1',
        show_search_for_time_slots: false,
        max_time_slots: 3,
        route_planning_deadline: new SvelteDate('2024-12-01').toISOString(),
        final_deadline: new SvelteDate('2024-12-05').toISOString(),
        introduction_text: [],
        privacy_policy_link: null,
        legal_notice_link: null,
      },
    });
  });

  it('should render main heading', async () => {
    render(Page);

    const heading = page.getByRole('heading', { level: 1 });
    await expect.element(heading).toBeInTheDocument();
    await expect.element(heading).toHaveTextContent('KjG Nikolaus Buchung');
  });

  it('should render app description', async () => {
    render(Page);

    await expect
      .element(page.getByText(/Buche deinen persönlichen Nikolausbesuch/))
      .toBeInTheDocument();
  });

  it('should initialize and render steps view when no intro text', async () => {
    render(Page);

    // Should show the booking root container
    const root = page.getByTestId('qa-booking-root');
    await expect.element(root).toBeInTheDocument();
  });

  it('should render deadline banner', async () => {
    render(Page);

    // Deadline banner should always be visible with both deadlines
    await expect.element(page.getByText(/Adresse und Zeitslots:/)).toBeInTheDocument();
    await expect.element(page.getByText(/Finale Deadline:/)).toBeInTheDocument();
  });
});
