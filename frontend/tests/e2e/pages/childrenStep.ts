import { expect, Page } from "@playwright/test";

export interface ChildInput {
  index: number;
  name: string;
  identification?: string;
  speech?: string;
}

export class ChildrenStep {
  constructor(private readonly page: Page) {}

  async addChild() {
    await this.page.getByTestId("qa-add-child").click();
  }

  async fillChild(input: ChildInput) {
    await this.page
      .getByTestId(`qa-child-name-${input.index}`)
      .fill(input.name);
    if (input.identification) {
      await this.page
        .getByTestId(`qa-child-identification-${input.index}`)
        .fill(input.identification);
    }
    if (input.speech) {
      await this.page
        .getByTestId(`qa-child-speech-${input.index}`)
        .fill(input.speech);
    }
  }

  async removeChild(index: number) {
    await this.page.getByTestId(`qa-remove-child-${index}`).click();
  }

  async fillNotes(notes: string) {
    await this.page.getByTestId("qa-additional-notes").fill(notes);
  }

  async submit() {
    await this.page.getByTestId("qa-children-submit").click();
  }

  async skip() {
    await this.page.getByTestId("qa-children-skip").click();
  }

  async expectChildCount(count: number) {
    await expect(
      this.page.locator('[data-testid^="qa-child-name-"]'),
    ).toHaveCount(count);
  }
}
