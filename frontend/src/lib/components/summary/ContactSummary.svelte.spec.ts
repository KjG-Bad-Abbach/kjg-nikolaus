import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ContactSummary from './ContactSummary.svelte';
import type { ContactPerson } from '$lib/types/booking';

describe('ContactSummary', () => {
  const finalDeadline = new Date('2024-12-05T19:30:00+01:00');
  const completeContact: ContactPerson = {
    first_name: 'Max',
    last_name: 'Mustermann',
    email: 'max@example.com',
    phone_number: '+49 123 456789',
  };

  it('should render with complete contact information', async () => {
    render(ContactSummary, {
      contactPerson: completeContact,
      finalDeadline,
      onEdit: vi.fn(),
    });

    const heading = page.getByRole('heading', { level: 3 });
    await expect.element(heading).toHaveTextContent('Kontaktinformationen');

    // Check that all labels and values are present
    await expect.element(page.getByText('Vorname:', { exact: false })).toBeInTheDocument();
    await expect.element(page.getByText('Nachname:', { exact: false })).toBeInTheDocument();
    await expect.element(page.getByText('Mustermann', { exact: true })).toBeInTheDocument();
    await expect.element(page.getByText('max@example.com', { exact: true })).toBeInTheDocument();
    await expect.element(page.getByText('+49 123 456789', { exact: true })).toBeInTheDocument();
  });

  it('should show missing field warning for empty first name', async () => {
    const incompleteContact: ContactPerson = {
      ...completeContact,
      first_name: '',
    };

    render(ContactSummary, {
      contactPerson: incompleteContact,
      finalDeadline,
      onEdit: vi.fn(),
    });

    const warning = page.getByText('Angabe fehlt', { exact: false });
    await expect.element(warning).toBeInTheDocument();
    await expect.element(warning).toHaveClass(/italic/);
    await expect.element(warning).toHaveClass(/text-rust/);
  });

  it('should show deadline in missing field warnings', async () => {
    const incompleteContact: ContactPerson = {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
    };

    render(ContactSummary, {
      contactPerson: incompleteContact,
      finalDeadline,
      onEdit: vi.fn(),
    });

    // Should show deadline formatted (format depends on timezone)
    // Check that "Angabe fehlt, Deadline:" text exists with deadline
    const warnings = page.getByText('Angabe fehlt, Deadline:', { exact: false });
    await expect.element(warnings.nth(0)).toBeInTheDocument();

    // Verify the deadline text contains date and time (with "Uhr")
    const deadlinePattern = page.getByText(/\d+\.\d+\..*\d+:\d+ Uhr/, { exact: false });
    await expect.element(deadlinePattern.nth(0)).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(ContactSummary, {
      contactPerson: completeContact,
      finalDeadline,
      onEdit,
    });

    const editButton = page.getByTitle('Bearbeiten');
    await editButton.click();

    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('should show missing field warnings for all empty fields', async () => {
    const nullContact = {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
    } as ContactPerson;

    render(ContactSummary, {
      contactPerson: nullContact,
      finalDeadline,
      onEdit: vi.fn(),
    });

    // Should show 4 warnings (one for each field)
    const warnings = page.getByText('Angabe fehlt', { exact: false });
    await expect.element(warnings.nth(0)).toBeInTheDocument();
    await expect.element(warnings.nth(1)).toBeInTheDocument();
    await expect.element(warnings.nth(2)).toBeInTheDocument();
    await expect.element(warnings.nth(3)).toBeInTheDocument();
  });

  it('should show all field labels correctly', async () => {
    render(ContactSummary, {
      contactPerson: completeContact,
      finalDeadline,
      onEdit: vi.fn(),
    });

    await expect.element(page.getByText('Vorname:', { exact: false })).toBeInTheDocument();
    await expect.element(page.getByText('Nachname:', { exact: false })).toBeInTheDocument();
    await expect.element(page.getByText('E-Mail:', { exact: false })).toBeInTheDocument();
    await expect.element(page.getByText('Telefonnummer:', { exact: false })).toBeInTheDocument();
  });

  it('should show missing field warning for empty last name', async () => {
    const incompleteContact: ContactPerson = {
      ...completeContact,
      last_name: '',
    };

    render(ContactSummary, {
      contactPerson: incompleteContact,
      finalDeadline,
      onEdit: vi.fn(),
    });

    const warning = page.getByText('Nachname:', { exact: false }).getByText('Angabe fehlt', {
      exact: false,
    });
    await expect.element(warning).toBeInTheDocument();
  });

  it('should show missing field warning for empty email', async () => {
    const incompleteContact: ContactPerson = {
      ...completeContact,
      email: '',
    };

    render(ContactSummary, {
      contactPerson: incompleteContact,
      finalDeadline,
      onEdit: vi.fn(),
    });

    const warnings = page.getByText('Angabe fehlt', { exact: false });
    await expect.element(warnings.nth(0)).toBeInTheDocument();
  });

  it('should show missing field warning for empty phone number', async () => {
    const incompleteContact: ContactPerson = {
      ...completeContact,
      phone_number: '',
    };

    render(ContactSummary, {
      contactPerson: incompleteContact,
      finalDeadline,
      onEdit: vi.fn(),
    });

    const warnings = page.getByText('Angabe fehlt', { exact: false });
    await expect.element(warnings.nth(0)).toBeInTheDocument();
  });
});
