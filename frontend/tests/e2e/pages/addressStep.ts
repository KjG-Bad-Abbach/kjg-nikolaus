import { expect, Page } from '@playwright/test';

export interface AddressDetails {
  street: string;
  houseNumber: string;
  zipCode: string;
  place: string;
  presentLocation?: string;
}

export class AddressStep {
  constructor(private readonly page: Page) {}

  async fill(address: AddressDetails) {
    await this.page.getByTestId('qa-address-street').fill(address.street);
    await this.page.getByTestId('qa-address-house-number').fill(address.houseNumber);
    await this.page.getByTestId('qa-address-zip').fill(address.zipCode);
    await this.page.getByTestId('qa-address-place').fill(address.place);
    if (address.presentLocation) {
      await this.page.getByTestId('qa-address-present-location').fill(address.presentLocation);
    }
  }

  async submit() {
    await this.page.getByTestId('qa-address-submit').click();
  }

  async expectReadonly() {
    await expect(this.page.getByTestId('qa-address-street')).not.toBeEditable();
    await expect(this.page.getByTestId('qa-address-place')).not.toBeEditable();
  }
}
