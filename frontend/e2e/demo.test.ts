import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
  // Arrange
  await page.route('**/api/config?*', (route) =>
    route.fulfill({
      json: {
        data: {
          id: 'smoke-test-config',
          introduction_text: [],
          max_time_slots: 3,
          show_search_for_time_slots: false,
          route_planning_deadline: '2099-12-01T00:00:00Z',
          final_deadline: '2099-12-24T00:00:00Z',
          legal_notice_link: null,
          privacy_policy_link: null,
        },
      },
    }),
  );
  const configResponse = page.waitForResponse((response) =>
    new URL(response.url()).pathname.endsWith('/api/config'),
  );

  // Act
  await page.goto('/');
  await configResponse;

  // Assert
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByTestId('qa-contact-form')).toBeVisible();
  await expect(page.getByTestId('qa-error-modal')).toHaveCount(0);
});
