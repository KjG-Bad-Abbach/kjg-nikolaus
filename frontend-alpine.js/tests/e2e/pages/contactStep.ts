import { expect, Locator, Page } from "@playwright/test";

export interface ContactDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export class ContactStep {
  constructor(private readonly page: Page) {}

  form(): Locator {
    return this.page.getByTestId("qa-contact-form");
  }

  async fill(details: ContactDetails) {
    await this.page
      .getByTestId("qa-contact-first-name")
      .fill(details.firstName);
    await this.page.getByTestId("qa-contact-last-name").fill(details.lastName);
    await this.page.getByTestId("qa-contact-email").fill(details.email);
    await this.page.getByTestId("qa-contact-phone").fill(details.phone);
  }

  async submit() {
    await this.page.getByTestId("qa-contact-submit").click();
  }

  async expectValidationVisible(fieldTestId: string, message: string) {
    const container = this.page
      .locator(`[data-testid="${fieldTestId}"]`)
      .locator("..");
    await expect(container.locator(".text-rust")).toContainText(message);
  }

  async expectVerificationViewVisible() {
    await expect(this.page.getByTestId("qa-email-verification")).toBeVisible();
  }

  async resendVerification() {
    await this.page.getByTestId("qa-email-resend").click();
  }
}
