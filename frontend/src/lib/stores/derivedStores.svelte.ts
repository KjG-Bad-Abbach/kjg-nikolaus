import { optionsStore } from './optionsStore.svelte';
import { bookingStore } from './bookingStore.svelte';
import { isFilled } from '$lib/utils/string';
import { getFirstIncompleteStep } from '$lib/utils/stepNavigation';

/**
 * Derived stores and computed values
 * These depend on other stores and recalculate when dependencies change
 */

class DerivedStores {
  private currentTime_ms = $state(Date.now());

  setCurrentTime(now_ms: number): void {
    this.currentTime_ms = now_ms;
  }

  private canEditBefore(deadline: Date | null, otherDeadline: Date | null): boolean {
    return deadline !== null && otherDeadline !== null && this.currentTime_ms < deadline.getTime();
  }

  /**
   * Can edit route planning (deadline not passed)
   */
  get canEditRoutePlanning(): boolean {
    return this.canEditBefore(optionsStore.route_planning_deadline, optionsStore.final_deadline);
  }

  /**
   * Can edit anything (final deadline not passed)
   */
  get canEditAnything(): boolean {
    return this.canEditBefore(optionsStore.final_deadline, optionsStore.route_planning_deadline);
  }

  /**
   * Is route planning data filled
   * (address and time slots)
   */
  get isRoutePlanningFilled(): boolean {
    const { location, time_slots } = bookingStore.booking;

    const isAddressFilled =
      isFilled(location?.street) &&
      isFilled(location?.house_number) &&
      isFilled(location?.zip_code) &&
      isFilled(location?.place);

    const areTimeSlotsFilled = time_slots?.length >= optionsStore.max_time_slots;

    return isAddressFilled && areTimeSlotsFilled;
  }

  /**
   * Is everything filled
   * (all required fields)
   */
  get isEverythingFilled(): boolean {
    return getFirstIncompleteStep(bookingStore.booking, optionsStore.max_time_slots) === 4;
  }
}

export const derivedStores = new DerivedStores();
export type { DerivedStores };
