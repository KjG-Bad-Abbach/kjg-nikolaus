import { expect, Page } from '@playwright/test';

export class SummaryPage {
  constructor(private readonly page: Page) {}

  async expectRouteCompleteVisible() {
    await expect(this.page.getByTestId('qa-summary-route-complete')).toBeVisible();
  }

  async expectMissingRoute() {
    await expect(this.page.getByTestId('qa-summary-route-missing')).toBeVisible();
  }

  async expectMissingDetails() {
    await expect(this.page.getByTestId('qa-summary-details-missing')).toBeVisible();
  }

  async expectNoMissingNotices() {
    await expect(this.page.getByTestId('qa-summary-route-missing')).toBeHidden();
    await expect(this.page.getByTestId('qa-summary-details-missing')).toBeHidden();
    await expect(this.page.getByTestId('qa-summary-route-complete')).toBeHidden();
  }

  async expectAllComplete() {
    const panel = this.page.getByTestId('qa-step-panel-summary');
    await expect(panel).toContainText('Wir haben alle erforderlichen Informationen erhalten.');
    await expect(panel).toContainText('Sobald wir die Routen geplant haben');
  }
}
