import type { RichTextNode } from '$lib/utils/richTextRenderer';
import { SvelteDate } from 'svelte/reactivity';

/**
 * Configuration options store
 * Manages application-wide configuration loaded from Strapi
 */

export interface Options {
  id: string | null;
  show_search_for_time_slots: boolean;
  max_time_slots: number;
  route_planning_deadline: SvelteDate;
  final_deadline: SvelteDate;
  introduction_text: RichTextNode[];
  privacy_policy_link: string | null;
  legal_notice_link: string | null;
}

class OptionsStore {
  id = $state<string | null>(null);
  show_search_for_time_slots = $state(false);
  max_time_slots = $state(3);
  route_planning_deadline = $state(new SvelteDate('2004-11-27T23:59:59+01:00'));
  final_deadline = $state(new SvelteDate('2004-12-01T23:59:59+01:00'));
  introduction_text = $state<RichTextNode[]>([]);
  privacy_policy_link = $state<string | null>(null);
  legal_notice_link = $state<string | null>(null);

  /**
   * Update all options from API response
   */
  update(data: Partial<Options>) {
    if (data.id !== undefined) this.id = data.id;
    if (data.show_search_for_time_slots !== undefined)
      this.show_search_for_time_slots = data.show_search_for_time_slots;
    if (data.max_time_slots !== undefined) this.max_time_slots = data.max_time_slots;
    if (data.route_planning_deadline !== undefined)
      this.route_planning_deadline = data.route_planning_deadline;
    if (data.final_deadline !== undefined) this.final_deadline = data.final_deadline;
    if (data.introduction_text !== undefined) this.introduction_text = data.introduction_text;
    if (data.privacy_policy_link !== undefined) this.privacy_policy_link = data.privacy_policy_link;
    if (data.legal_notice_link !== undefined) this.legal_notice_link = data.legal_notice_link;
  }

  /**
   * Reset to default values
   */
  reset() {
    this.id = null;
    this.show_search_for_time_slots = false;
    this.max_time_slots = 3;
    this.route_planning_deadline = new SvelteDate('2004-11-27T23:59:59+01:00');
    this.final_deadline = new SvelteDate('2004-12-01T23:59:59+01:00');
    this.introduction_text = [];
    this.privacy_policy_link = null;
    this.legal_notice_link = null;
  }
}

export const optionsStore = new OptionsStore();
export type { OptionsStore };
