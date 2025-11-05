import { optionsStore } from './optionsStore.svelte';
import { bookingStore } from './bookingStore.svelte';
import { isFilled } from '$lib/utils/string';
import { SvelteDate } from 'svelte/reactivity';

/**
 * Derived stores and computed values
 * These depend on other stores and recalculate when dependencies change
 */

class DerivedStores {
  /**
   * Can edit route planning (deadline not passed)
   */
  get canEditRoutePlanning(): boolean {
    return new SvelteDate() < optionsStore.route_planning_deadline;
  }

  /**
   * Can edit anything (final deadline not passed)
   */
  get canEditAnything(): boolean {
    return new SvelteDate() < optionsStore.final_deadline;
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
    const { contact_person, location, present_location, time_slots, children } =
      bookingStore.booking;

    const isContactDetailsFilled =
      isFilled(contact_person?.first_name) &&
      isFilled(contact_person?.last_name) &&
      isFilled(contact_person?.email) &&
      isFilled(contact_person?.phone_number);

    const isAddressFilled =
      isFilled(location?.street) &&
      isFilled(location?.house_number) &&
      isFilled(location?.zip_code) &&
      isFilled(location?.place);

    const isPresentLocationFilled = isFilled(present_location);

    const areTimeSlotsFilled = time_slots?.length >= optionsStore.max_time_slots;

    const areChildrenFilled =
      !!children?.length &&
      children.every(
        (child) =>
          isFilled(child.name) && isFilled(child.identification_trait) && isFilled(child.speech),
      );

    return (
      isContactDetailsFilled &&
      isAddressFilled &&
      isPresentLocationFilled &&
      areTimeSlotsFilled &&
      areChildrenFilled
    );
  }
}

export const derivedStores = new DerivedStores();
export type { DerivedStores };
