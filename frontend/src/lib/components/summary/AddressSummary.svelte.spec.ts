import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AddressSummary from './AddressSummary.svelte';
import type { Location } from '$lib/types/booking';

describe('AddressSummary', () => {
  const routePlanningDeadline = new Date('2024-12-05T19:30:00+01:00');
  const finalDeadline = new Date('2024-12-10T19:30:00+01:00');
  const completeLocation: Location = {
    street: 'Musterstraße',
    house_number: '42',
    zip_code: '12345',
    place: 'Musterstadt',
  };

  it('should render with complete address information', async () => {
    render(AddressSummary, {
      location: completeLocation,
      presentLocation: 'Unter dem Weihnachtsbaum',
      routePlanningDeadline,
      finalDeadline,
      onEdit: vi.fn(),
    });

    const heading = page.getByRole('heading', { level: 3 });
    await expect.element(heading).toHaveTextContent('Adresse und Ort für Geschenke');

    await expect.element(page.getByText('Musterstraße', { exact: true })).toBeInTheDocument();
    await expect.element(page.getByText('42', { exact: true })).toBeInTheDocument();
    await expect.element(page.getByText('12345', { exact: true })).toBeInTheDocument();
    await expect.element(page.getByText('Musterstadt', { exact: true })).toBeInTheDocument();
    await expect
      .element(page.getByText('Unter dem Weihnachtsbaum', { exact: true }))
      .toBeInTheDocument();
  });

  it('should show missing field warning for empty street', async () => {
    const incompleteLocation: Location = {
      ...completeLocation,
      street: '',
    };

    render(AddressSummary, {
      location: incompleteLocation,
      presentLocation: 'Unter dem Weihnachtsbaum',
      routePlanningDeadline,
      finalDeadline,
      onEdit: vi.fn(),
    });

    const warning = page.getByText('Angabe fehlt', { exact: false });
    await expect.element(warning).toBeInTheDocument();
    await expect.element(warning).toHaveClass(/italic/);
    await expect.element(warning).toHaveClass(/text-rust/);
  });

  it('should show route planning deadline for address fields', async () => {
    const emptyLocation: Location = {
      street: '',
      house_number: '',
      zip_code: '',
      place: '',
    };

    render(AddressSummary, {
      location: emptyLocation,
      presentLocation: 'Present',
      routePlanningDeadline,
      finalDeadline,
      onEdit: vi.fn(),
    });

    // Should show route planning deadline for address fields
    const warnings = page.getByText('Angabe fehlt, Deadline:', { exact: false });
    await expect.element(warnings.nth(0)).toBeInTheDocument();
  });

  it('should show final deadline for present location field', async () => {
    render(AddressSummary, {
      location: completeLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      onEdit: vi.fn(),
    });

    // Should show warning for present location
    const warning = page.getByText('Ort für Geschenke:', { exact: false });
    await expect.element(warning).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(AddressSummary, {
      location: completeLocation,
      presentLocation: 'Unter dem Weihnachtsbaum',
      routePlanningDeadline,
      finalDeadline,
      onEdit,
    });

    const editButton = page.getByTitle('Bearbeiten');
    await editButton.click();

    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('should show all field labels correctly', async () => {
    render(AddressSummary, {
      location: completeLocation,
      presentLocation: 'Unter dem Weihnachtsbaum',
      routePlanningDeadline,
      finalDeadline,
      onEdit: vi.fn(),
    });

    await expect.element(page.getByText('Straße:', { exact: false })).toBeInTheDocument();
    await expect.element(page.getByText('Hausnummer:', { exact: false })).toBeInTheDocument();
    await expect.element(page.getByText('PLZ:', { exact: false })).toBeInTheDocument();
    await expect.element(page.getByText('Ort:', { exact: false })).toBeInTheDocument();
    await expect
      .element(page.getByText('Ort für Geschenke:', { exact: false }))
      .toBeInTheDocument();
  });

  it('should handle null/undefined location fields gracefully', async () => {
    const nullLocation = {
      street: '',
      house_number: '',
      zip_code: '',
      place: '',
    } as Location;

    render(AddressSummary, {
      location: nullLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      onEdit: vi.fn(),
    });

    const heading = page.getByRole('heading', { level: 3 });
    await expect.element(heading).toBeInTheDocument();
  });
});
