import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TimeSlotStep from './TimeSlotStep.svelte';
import type { TimeSlot } from '$lib/types/booking';

describe('TimeSlotStep', () => {
  const routePlanningDeadline = new Date('2024-12-01T19:30:00+01:00');

  const availableTimeSlots: TimeSlot[] = [
    {
      id: '1',
      documentId: 'doc1',
      start: '2024-12-05T18:00:00+01:00',
      end: '2024-12-05T19:00:00+01:00',
      label: 'Do 5.12. 18:00 - 19:00 Uhr',
      max_bookings: 4,
    },
    {
      id: '2',
      documentId: 'doc2',
      start: '2024-12-05T19:00:00+01:00',
      end: '2024-12-05T20:00:00+01:00',
      label: 'Do 5.12. 19:00 - 20:00 Uhr',
      max_bookings: 4,
    },
    {
      id: '3',
      documentId: 'doc3',
      start: '2024-12-06T18:00:00+01:00',
      end: '2024-12-06T19:00:00+01:00',
      label: 'Fr 6.12. 18:00 - 19:00 Uhr',
      max_bookings: 4,
    },
  ];

  it('should render heading with max slots when editable', async () => {
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: [],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: true,
      showSearch: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect
      .element(page.getByRole('heading', { level: 2 }))
      .toHaveTextContent(/Wähle.*3.*unterschiedliche Zeitslots/);
  });

  it('should render readonly heading when not editable', async () => {
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: ['1'],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: false,
      showSearch: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const heading = page.getByRole('heading', { level: 2 });
    await expect.element(heading).toHaveTextContent('Ausgewählte Zeitslots');
  });

  it('should display route planning deadline notice', async () => {
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: [],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: true,
      showSearch: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect
      .element(page.getByText('Hinweis: Deadline für diese Angaben', { exact: false }))
      .toBeInTheDocument();
  });

  it('should show warning when editing is disabled', async () => {
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: [],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: false,
      showSearch: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect
      .element(
        page.getByText('Nach der Deadline können die Angaben nicht mehr bearbeitet werden', {
          exact: false,
        }),
      )
      .toBeInTheDocument();
  });

  it('should show max selection warning when limit reached', async () => {
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: ['1', '2', '3'],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: true,
      showSearch: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByText('Du kannst maximal', { exact: false })).toBeInTheDocument();
  });

  it('should show search input when showSearch is true', async () => {
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: [],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: true,
      showSearch: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const searchInput = page.getByTestId('qa-time-slot-search');
    await expect.element(searchInput).toBeInTheDocument();
  });

  it('should hide search input when showSearch is false', async () => {
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: [],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: true,
      showSearch: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const searchInput = page.getByTestId('qa-time-slot-search');
    await expect.element(searchInput).not.toBeInTheDocument();
  });

  it('should render time slot checkboxes when editable', async () => {
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: [],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: true,
      showSearch: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByTestId('qa-time-slot-1')).toBeInTheDocument();
    await expect.element(page.getByTestId('qa-time-slot-2')).toBeInTheDocument();
    await expect.element(page.getByTestId('qa-time-slot-3')).toBeInTheDocument();
  });

  it('should call onChange when time slot is selected', async () => {
    const onChange = vi.fn();
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: [],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: true,
      showSearch: false,
      validationMessages: {},
      onChange,
      onSubmit: vi.fn(),
    });

    const checkbox = page.getByTestId('qa-time-slot-1').getByRole('checkbox');
    await checkbox.click();

    expect(onChange).toHaveBeenCalled();
    const call = onChange.mock.calls[0][0];
    expect(call).toContain('1');
  });

  it('should call onChange when time slot is deselected via checkbox', async () => {
    const onChange = vi.fn();
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: ['1', '2'],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: true,
      showSearch: false,
      validationMessages: {},
      onChange,
      onSubmit: vi.fn(),
    });

    const checkbox = page.getByTestId('qa-time-slot-1').getByRole('checkbox');
    await checkbox.click();

    expect(onChange).toHaveBeenCalled();
    const call = onChange.mock.calls[0][0];
    expect(call).not.toContain('1');
    expect(call).toContain('2');
  });

  it('should show selected slots in summary list', async () => {
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: ['1', '2'],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: true,
      showSearch: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByTestId('qa-selected-time-slot-1')).toBeInTheDocument();
    await expect.element(page.getByTestId('qa-selected-time-slot-2')).toBeInTheDocument();
  });

  it('should call onChange when removing a selected slot', async () => {
    const onChange = vi.fn();
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: ['1', '2'],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: true,
      showSearch: false,
      validationMessages: {},
      onChange,
      onSubmit: vi.fn(),
    });

    const removeButton = page.getByTestId('qa-remove-selected-slot-1');
    await removeButton.click();

    expect(onChange).toHaveBeenCalled();
    const call = onChange.mock.calls[0][0];
    expect(call).not.toContain('1');
    expect(call).toContain('2');
  });

  it('should show warning when fewer than max slots selected', async () => {
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: ['1'],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: true,
      showSearch: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect
      .element(page.getByText('Bitte wähle mindestens', { exact: false }))
      .toBeInTheDocument();
  });

  it('should show submit button when editable', async () => {
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: ['1', '2', '3'],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: true,
      showSearch: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const submitButton = page.getByTestId('qa-time-slot-submit');
    await expect.element(submitButton).toBeInTheDocument();
  });

  it('should hide submit button when not editable', async () => {
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: ['1'],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: false,
      showSearch: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const submitButton = page.getByTestId('qa-time-slot-submit');
    await expect.element(submitButton).not.toBeInTheDocument();
  });

  it('should call onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: ['1', '2', '3'],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: true,
      showSearch: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit,
    });

    const submitButton = page.getByTestId('qa-time-slot-submit');
    await submitButton.click();

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('should show validation error when there are messages', async () => {
    const validationMessages = {
      'booking.time_slots': ['Bitte wähle mindestens 3 Zeitslots'],
    };

    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: [],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: true,
      showSearch: false,
      validationMessages,
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByText('Bitte überprüfe deine Eingaben.')).toBeInTheDocument();
  });

  it('should filter slots by search query', async () => {
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: [],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: true,
      showSearch: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const searchInput = page.getByTestId('qa-time-slot-search');
    await searchInput.fill('Fr 6.12');

    // Should show only the Friday slot
    await expect.element(page.getByTestId('qa-time-slot-3')).toBeInTheDocument();
    // Thursday slots should be hidden (not in DOM when filtered)
    await expect.element(page.getByTestId('qa-time-slot-1')).not.toBeInTheDocument();
  });

  it('should check selected slots', async () => {
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: ['1', '2'],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: true,
      showSearch: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const checkbox1 = page.getByTestId('qa-time-slot-1').getByRole('checkbox');
    const checkbox2 = page.getByTestId('qa-time-slot-2').getByRole('checkbox');
    const checkbox3 = page.getByTestId('qa-time-slot-3').getByRole('checkbox');

    await expect.element(checkbox1).toBeChecked();
    await expect.element(checkbox2).toBeChecked();
    await expect.element(checkbox3).not.toBeChecked();
  });

  it('should disable checkboxes when max slots reached', async () => {
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: ['1', '2'],
      maxTimeSlots: 2,
      routePlanningDeadline,
      canEditRoutePlanning: true,
      showSearch: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const checkbox1 = page.getByTestId('qa-time-slot-1').getByRole('checkbox');
    await expect.element(checkbox1).toBeChecked();
    await expect.element(checkbox1).not.toBeDisabled();

    const checkbox2 = page.getByTestId('qa-time-slot-2').getByRole('checkbox');
    await expect.element(checkbox2).toBeChecked();
    await expect.element(checkbox2).not.toBeDisabled();

    const checkbox3 = page.getByTestId('qa-time-slot-3').getByRole('checkbox');
    await expect.element(checkbox3).not.toBeChecked();
    await expect.element(checkbox3).toBeDisabled();
  });

  it('should group slots by date', async () => {
    render(TimeSlotStep, {
      availableTimeSlots,
      selectedTimeSlotIds: [],
      maxTimeSlots: 3,
      routePlanningDeadline,
      canEditRoutePlanning: true,
      showSearch: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    // Should have two date headings (dates include year if not current year)
    await expect
      .element(page.getByRole('heading', { level: 4 }).filter({ hasText: /Do 5\.12\./ }))
      .toBeInTheDocument();
    await expect
      .element(page.getByRole('heading', { level: 4 }).filter({ hasText: /Fr 6\.12\./ }))
      .toBeInTheDocument();
  });
});
