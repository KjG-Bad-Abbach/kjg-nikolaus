import { page } from 'vitest/browser';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

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
    // Mock API responses
    const { sendRequest } = await import('$lib/api/client');
    vi.mocked(sendRequest).mockResolvedValue({
      data: {
        id: '1',
        show_search_for_time_slots: false,
        max_time_slots: 3,
        route_planning_deadline: new Date('2024-12-01').toISOString(),
        final_deadline: new Date('2024-12-05').toISOString(),
        introduction_text: [],
        privacy_policy_link: null,
        legal_notice_link: null,
      },
    });
  });

  it('should render h1', async () => {
    render(Page);

    const heading = page.getByRole('heading', { level: 1 });
    await expect.element(heading).toBeInTheDocument();
  });
});
