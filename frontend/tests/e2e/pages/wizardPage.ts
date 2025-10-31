import { expect, Locator, Page } from '@playwright/test';
import { ContactStep } from './contactStep';
import { AddressStep } from './addressStep';
import { TimeSlotStep } from './timeSlotStep';
import { ChildrenStep } from './childrenStep';
import { SummaryPage } from './summaryPage';
import { ErrorModal } from './errorModal';

const STEP_TARGETS: Record<string, string> = {
  contact: 'qa-contact-form',
  address: 'qa-address-form',
  'time-slot': 'qa-time-slot-form',
  children: 'qa-children-form',
  summary: 'qa-step-panel-summary',
};

export class WizardPage {
  constructor(public readonly page: Page) {}

  async goto(query = '') {
    await this.page.goto(`/${query}`);
    await expect(this.root()).toBeVisible();
  }

  async resume(bookingId: string) {
    await this.goto(`?id=${bookingId}`);
    await expect(this.page.getByTestId('qa-view-steps')).toBeVisible();
  }

  root(): Locator {
    return this.page.getByTestId('qa-booking-root');
  }

  introStartButton(): Locator {
    return this.page.getByTestId('qa-intro-start');
  }

  async startWizard() {
    await this.introStartButton().click();
    await expect(this.contactStep().form()).toBeVisible();
  }

  contactStep() {
    return new ContactStep(this.page);
  }

  addressStep() {
    return new AddressStep(this.page);
  }

  timeSlotStep() {
    return new TimeSlotStep(this.page);
  }

  childrenStep() {
    return new ChildrenStep(this.page);
  }

  summaryPage() {
    return new SummaryPage(this.page);
  }

  errorModal() {
    return new ErrorModal(this.page);
  }

  async jumpToStep(stepTestId: string) {
    await this.page.getByTestId(`qa-step-${stepTestId}`).click();
    const targetTestId = STEP_TARGETS[stepTestId];
    if (targetTestId) {
      await expect(this.page.getByTestId(targetTestId)).toBeVisible();
    }
  }
}
