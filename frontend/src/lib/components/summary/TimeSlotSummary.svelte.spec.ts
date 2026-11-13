import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import TimeSlotSummary from './TimeSlotSummary.svelte';
import type { TimeSlot } from '$lib/types/booking';

describe('TimeSlotSummary', () => {
  const routePlanningDeadline = new Date('2024-12-05T19:30:00+01:00');
  const maxTimeSlots = 3;

  const timeSlots: TimeSlot[] = [
    {
      id: '1',
      documentId: 'doc1',
      start: '2024-12-05T19:30:00+01:00',
      end: '2024-12-05T20:30:00+01:00',
      label: 'Fr 5.12. 19:30 - 20:30 Uhr',
    },
    {
      id: '2',
      documentId: 'doc2',
      start: '2024-12-05T20:30:00+01:00',
      end: '2024-12-05T21:30:00+01:00',
      label: 'Fr 5.12. 20:30 - 21:30 Uhr',
    },
    {
      id: '3',
      documentId: 'doc3',
      start: '2024-12-05T21:30:00+01:00',
      end: '2024-12-05T22:30:00+01:00',
      label: 'Fr 5.12. 21:30 - 22:30 Uhr',
    },
  ];

  it('should render with complete time slot selection', async () => {
    render(TimeSlotSummary, {
      selectedTimeSlots: timeSlots,
      maxTimeSlots,
      routePlanningDeadline,
      onEdit: vi.fn(),
    });

    const heading = page.getByRole('heading', { level: 3 });
    await expect.element(heading).toHaveTextContent('Ausgewählte Zeitslots');

    await expect
      .element(page.getByText('Fr 5.12. 19:30 - 20:30 Uhr', { exact: true }))
      .toBeInTheDocument();
    await expect
      .element(page.getByText('Fr 5.12. 20:30 - 21:30 Uhr', { exact: true }))
      .toBeInTheDocument();
    await expect
      .element(page.getByText('Fr 5.12. 21:30 - 22:30 Uhr', { exact: true }))
      .toBeInTheDocument();
  });

  it('should show missing field warning when no slots selected', async () => {
    render(TimeSlotSummary, {
      selectedTimeSlots: [],
      maxTimeSlots,
      routePlanningDeadline,
      onEdit: vi.fn(),
    });

    const warning = page.getByText('Angabe fehlt', { exact: false });
    await expect.element(warning).toBeInTheDocument();
    await expect.element(warning).toHaveClass(/italic/);
    await expect.element(warning).toHaveClass(/text-rust/);
  });

  it('should show incomplete warning when fewer than max slots selected', async () => {
    render(TimeSlotSummary, {
      selectedTimeSlots: [timeSlots[0]],
      maxTimeSlots,
      routePlanningDeadline,
      onEdit: vi.fn(),
    });

    const warning = page.getByText(/Bitte.*Zeitslots auswählen/, { exact: false });
    await expect.element(warning).toBeInTheDocument();
    await expect.element(warning).toHaveClass(/italic/);
    await expect.element(warning).toHaveClass(/text-rust/);
  });

  it('should display max time slots number in warning', async () => {
    render(TimeSlotSummary, {
      selectedTimeSlots: [timeSlots[0]],
      maxTimeSlots: 5,
      routePlanningDeadline,
      onEdit: vi.fn(),
    });

    const warning = page.getByText(/Bitte 5 Zeitslots auswählen/, { exact: false });
    await expect.element(warning).toBeInTheDocument();
  });

  it('should not show incomplete warning when exactly max slots selected', async () => {
    render(TimeSlotSummary, {
      selectedTimeSlots: timeSlots,
      maxTimeSlots,
      routePlanningDeadline,
      onEdit: vi.fn(),
    });

    const warning = page.getByText(/Bitte.*Zeitslots auswählen/, { exact: false });
    await expect.element(warning).not.toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(TimeSlotSummary, {
      selectedTimeSlots: timeSlots,
      maxTimeSlots,
      routePlanningDeadline,
      onEdit,
    });

    const editButton = page.getByTitle('Bearbeiten');
    await editButton.click();

    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('should show deadline in warnings', async () => {
    render(TimeSlotSummary, {
      selectedTimeSlots: [],
      maxTimeSlots,
      routePlanningDeadline,
      onEdit: vi.fn(),
    });

    const deadline = page.getByText('Deadline:', { exact: false });
    await expect.element(deadline).toBeInTheDocument();
  });
});
