import { expect, Page } from "@playwright/test";

export class TimeSlotStep {
  constructor(private readonly page: Page) {}

  async search(value: string) {
    const search = this.page.getByTestId("qa-time-slot-search");
    await search.fill("");
    await search.type(value);
  }

  async toggleSlot(slotId: string) {
    await this.page.getByTestId(`qa-time-slot-${slotId}`).click();
  }

  async removeSelected(slotId: string) {
    await this.page.getByTestId(`qa-remove-selected-slot-${slotId}`).click();
  }

  async submit() {
    await this.page.getByTestId("qa-time-slot-submit").click();
  }

  async expectSelected(slotId: string) {
    await expect(
      this.page.getByTestId(`qa-selected-time-slot-${slotId}`),
    ).toBeVisible();
  }
}
