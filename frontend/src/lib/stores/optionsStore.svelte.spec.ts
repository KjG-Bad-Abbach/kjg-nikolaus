import { describe, expect, it, beforeEach } from 'vitest';
import { optionsStore } from './optionsStore.svelte';

describe('optionsStore', () => {
  beforeEach(() => {
    optionsStore.reset();
  });

  it('should have default values', () => {
    expect(optionsStore.id).toBe(null);
    expect(optionsStore.show_search_for_time_slots).toBe(false);
    expect(optionsStore.max_time_slots).toBe(3);
    expect(optionsStore.route_planning_deadline).toEqual(new Date('2004-11-27T23:59:59+01:00'));
    expect(optionsStore.final_deadline).toEqual(new Date('2004-12-01T23:59:59+01:00'));
    expect(optionsStore.introduction_text).toEqual([]);
    expect(optionsStore.privacy_policy_link).toBe(null);
    expect(optionsStore.legal_notice_link).toBe(null);
  });

  it('should update individual options', () => {
    optionsStore.update({
      id: '123',
      show_search_for_time_slots: true,
      max_time_slots: 5,
    });

    expect(optionsStore.id).toBe('123');
    expect(optionsStore.show_search_for_time_slots).toBe(true);
    expect(optionsStore.max_time_slots).toBe(5);
  });

  it('should update route_planning_deadline', () => {
    const newDeadline = new Date('2024-12-05T23:59:59+01:00');
    optionsStore.update({ route_planning_deadline: newDeadline });

    expect(optionsStore.route_planning_deadline).toEqual(newDeadline);
  });

  it('should update final_deadline', () => {
    const newDeadline = new Date('2024-12-10T23:59:59+01:00');
    optionsStore.update({ final_deadline: newDeadline });

    expect(optionsStore.final_deadline).toEqual(newDeadline);
  });

  it('should update introduction_text', () => {
    const richText = [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Hello World' }],
      },
    ];
    optionsStore.update({ introduction_text: richText });

    expect(optionsStore.introduction_text).toEqual(richText);
  });

  it('should update privacy_policy_link', () => {
    optionsStore.update({ privacy_policy_link: 'https://example.com/privacy' });

    expect(optionsStore.privacy_policy_link).toBe('https://example.com/privacy');
  });

  it('should update legal_notice_link', () => {
    optionsStore.update({ legal_notice_link: 'https://example.com/legal' });

    expect(optionsStore.legal_notice_link).toBe('https://example.com/legal');
  });

  it('should update multiple options at once', () => {
    const richText = [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'Welcome' }],
      },
    ];

    optionsStore.update({
      id: '456',
      show_search_for_time_slots: true,
      max_time_slots: 7,
      introduction_text: richText,
      privacy_policy_link: 'https://example.com/privacy',
      legal_notice_link: 'https://example.com/legal',
    });

    expect(optionsStore.id).toBe('456');
    expect(optionsStore.show_search_for_time_slots).toBe(true);
    expect(optionsStore.max_time_slots).toBe(7);
    expect(optionsStore.introduction_text).toEqual(richText);
    expect(optionsStore.privacy_policy_link).toBe('https://example.com/privacy');
    expect(optionsStore.legal_notice_link).toBe('https://example.com/legal');
  });

  it('should reset to default values', () => {
    optionsStore.update({
      id: '789',
      show_search_for_time_slots: true,
      max_time_slots: 10,
    });

    optionsStore.reset();

    expect(optionsStore.id).toBe(null);
    expect(optionsStore.show_search_for_time_slots).toBe(false);
    expect(optionsStore.max_time_slots).toBe(3);
  });

  it('should preserve unchanged values when updating partial options', () => {
    optionsStore.update({
      id: 'initial',
      max_time_slots: 5,
    });

    optionsStore.update({
      show_search_for_time_slots: true,
    });

    expect(optionsStore.id).toBe('initial');
    expect(optionsStore.max_time_slots).toBe(5);
    expect(optionsStore.show_search_for_time_slots).toBe(true);
  });

  it('should handle undefined values in update', () => {
    optionsStore.update({
      id: '999',
    });

    optionsStore.update({
      id: undefined,
      max_time_slots: 4,
    });

    // id should remain unchanged when undefined
    expect(optionsStore.id).toBe('999');
    expect(optionsStore.max_time_slots).toBe(4);
  });
});
