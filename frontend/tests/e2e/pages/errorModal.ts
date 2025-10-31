import { expect, Page } from '@playwright/test';

export class ErrorModal {
  constructor(private readonly page: Page) {}

  async expectVisible() {
    await expect(this.page.getByTestId('qa-error-modal')).toBeVisible();
  }

  async openDetails() {
    const toggle = this.page.getByTestId('qa-error-details-toggle');
    await toggle.scrollIntoViewIfNeeded();
    await expect(toggle).toBeVisible();
    await toggle.click();
  }

  async retry() {
    await this.page.getByTestId('qa-error-retry').click();
  }

  async dismiss() {
    await this.page.getByTestId('qa-error-dismiss').click();
  }
}
