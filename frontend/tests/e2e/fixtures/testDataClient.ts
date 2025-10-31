import { expect, Page } from '@playwright/test';
import { BookingRecord } from './types';

interface HookState {
  bookings: Record<string, BookingRecord>;
  timeSlots: unknown;
  config: unknown;
}

export class TestDataClient {
  constructor(private readonly page: Page) {}

  async getState(): Promise<HookState> {
    return this.page.evaluate(() => {
      const hook = (window as unknown as { __bookingTestApi?: { inspectState: () => HookState } }).__bookingTestApi;
      if (!hook) {
        throw new Error('booking test hook not installed');
      }
      return hook.inspectState();
    });
  }

  async expectBookingField(documentId: string, selector: (booking: BookingRecord) => unknown, matcher: (value: unknown) => void) {
    const state = await this.getState();
    const booking = state.bookings[documentId];
    expect(booking, `Booking ${documentId} should exist`).toBeTruthy();
    matcher(selector(booking));
  }
}
