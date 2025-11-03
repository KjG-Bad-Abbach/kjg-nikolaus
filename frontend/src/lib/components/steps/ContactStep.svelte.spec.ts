import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ContactStep from './ContactStep.svelte';
import type { ContactPerson } from '$lib/types/booking';

describe('ContactStep', () => {
  const finalDeadline = new Date('2024-12-05T19:30:00+01:00');
  const emptyContact: ContactPerson = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
  };

  const filledContact: ContactPerson = {
    first_name: 'Max',
    last_name: 'Mustermann',
    email: 'max@example.com',
    phone_number: '+49 123 456789',
  };

  it('should render form with all fields', async () => {
    render(ContactStep, {
      contactPerson: emptyContact,
      finalDeadline,
      canEdit: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const heading = page.getByRole('heading', { level: 2 });
    await expect.element(heading).toHaveTextContent('Kontaktinformationen');

    // Check all fields are present
    await expect.element(page.getByTestId('qa-contact-first-name')).toBeInTheDocument();
    await expect.element(page.getByTestId('qa-contact-last-name')).toBeInTheDocument();
    await expect.element(page.getByTestId('qa-contact-email')).toBeInTheDocument();
    await expect.element(page.getByTestId('qa-contact-phone')).toBeInTheDocument();
  });

  it('should display deadline notice', async () => {
    render(ContactStep, {
      contactPerson: emptyContact,
      finalDeadline,
      canEdit: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const deadlineText = page.getByText('Hinweis: Deadline für diese Angaben', {
      exact: false,
    });
    await expect.element(deadlineText).toBeInTheDocument();
  });

  it('should show warning when editing is disabled', async () => {
    render(ContactStep, {
      contactPerson: emptyContact,
      finalDeadline,
      canEdit: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const warning = page.getByText(
      'Nach der Deadline können die Angaben nicht mehr bearbeitet werden',
      {
        exact: false,
      },
    );
    await expect.element(warning).toBeInTheDocument();
  });

  it('should not show warning when editing is enabled', async () => {
    render(ContactStep, {
      contactPerson: emptyContact,
      finalDeadline,
      canEdit: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const warning = page.getByText(
      'Nach der Deadline können die Angaben nicht mehr bearbeitet werden',
      {
        exact: false,
      },
    );
    await expect.element(warning).not.toBeInTheDocument();
  });

  it('should populate fields with contact data', async () => {
    render(ContactStep, {
      contactPerson: filledContact,
      finalDeadline,
      canEdit: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const firstNameInput = page.getByTestId('qa-contact-first-name');
    await expect.element(firstNameInput).toHaveValue('Max');

    const lastNameInput = page.getByTestId('qa-contact-last-name');
    await expect.element(lastNameInput).toHaveValue('Mustermann');

    const emailInput = page.getByTestId('qa-contact-email');
    await expect.element(emailInput).toHaveValue('max@example.com');

    const phoneInput = page.getByTestId('qa-contact-phone');
    await expect.element(phoneInput).toHaveValue('+49 123 456789');
  });

  it('should make fields readonly when canEdit is false', async () => {
    render(ContactStep, {
      contactPerson: filledContact,
      finalDeadline,
      canEdit: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const firstNameInput = page.getByTestId('qa-contact-first-name');
    await expect.element(firstNameInput).toHaveAttribute('readonly');

    const lastNameInput = page.getByTestId('qa-contact-last-name');
    await expect.element(lastNameInput).toHaveAttribute('readonly');

    const emailInput = page.getByTestId('qa-contact-email');
    await expect.element(emailInput).toHaveAttribute('readonly');

    const phoneInput = page.getByTestId('qa-contact-phone');
    await expect.element(phoneInput).toHaveAttribute('readonly');
  });

  it('should call onChange when input values change', async () => {
    const onChange = vi.fn();
    render(ContactStep, {
      contactPerson: emptyContact,
      finalDeadline,
      canEdit: true,
      validationMessages: {},
      onChange,
      onSubmit: vi.fn(),
    });

    const firstNameInput = page.getByTestId('qa-contact-first-name');
    await firstNameInput.fill('John');

    expect(onChange).toHaveBeenCalled();
    const call = onChange.mock.calls[0][0];
    expect(call.first_name).toBe('John');
  });

  it('should call onChange when last name changes', async () => {
    const onChange = vi.fn();
    render(ContactStep, {
      contactPerson: emptyContact,
      finalDeadline,
      canEdit: true,
      validationMessages: {},
      onChange,
      onSubmit: vi.fn(),
    });

    const lastNameInput = page.getByTestId('qa-contact-last-name');
    await lastNameInput.fill('Doe');

    expect(onChange).toHaveBeenCalled();
    const call = onChange.mock.calls[0][0];
    expect(call.last_name).toBe('Doe');
  });

  it('should call onChange when email changes', async () => {
    const onChange = vi.fn();
    render(ContactStep, {
      contactPerson: emptyContact,
      finalDeadline,
      canEdit: true,
      validationMessages: {},
      onChange,
      onSubmit: vi.fn(),
    });

    const emailInput = page.getByTestId('qa-contact-email');
    await emailInput.fill('john@example.com');

    expect(onChange).toHaveBeenCalled();
    const call = onChange.mock.calls[0][0];
    expect(call.email).toBe('john@example.com');
  });

  it('should call onChange when phone changes', async () => {
    const onChange = vi.fn();
    render(ContactStep, {
      contactPerson: emptyContact,
      finalDeadline,
      canEdit: true,
      validationMessages: {},
      onChange,
      onSubmit: vi.fn(),
    });

    const phoneInput = page.getByTestId('qa-contact-phone');
    await phoneInput.fill('123456789');

    expect(onChange).toHaveBeenCalled();
    const call = onChange.mock.calls[0][0];
    expect(call.phone_number).toBe('123456789');
  });

  it('should display validation messages for each field', async () => {
    const validationMessages = {
      'booking.contact_person.first_name': ['First name is required'],
      'booking.contact_person.email': ['Email is invalid', 'Email must be unique'],
    };

    render(ContactStep, {
      contactPerson: emptyContact,
      finalDeadline,
      canEdit: true,
      validationMessages,
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByText('First name is required')).toBeInTheDocument();
    await expect.element(page.getByText('Email is invalid')).toBeInTheDocument();
    await expect.element(page.getByText('Email must be unique')).toBeInTheDocument();
  });

  it('should show submit button when canEdit is true', async () => {
    render(ContactStep, {
      contactPerson: filledContact,
      finalDeadline,
      canEdit: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const submitButton = page.getByTestId('qa-contact-submit');
    await expect.element(submitButton).toBeInTheDocument();
    await expect.element(submitButton).toHaveTextContent('Speichern & Weiter');
  });

  it('should hide submit button when canEdit is false', async () => {
    render(ContactStep, {
      contactPerson: filledContact,
      finalDeadline,
      canEdit: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const submitButton = page.getByTestId('qa-contact-submit');
    await expect.element(submitButton).not.toBeInTheDocument();
  });

  it('should call onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault());
    render(ContactStep, {
      contactPerson: filledContact,
      finalDeadline,
      canEdit: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit,
    });

    const submitButton = page.getByTestId('qa-contact-submit');
    await submitButton.click();

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('should show general validation error when there are validation messages', async () => {
    const validationMessages = {
      'booking.contact_person.first_name': ['Error 1'],
      'booking.contact_person.email': ['Error 2'],
    };

    render(ContactStep, {
      contactPerson: emptyContact,
      finalDeadline,
      canEdit: true,
      validationMessages,
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByText('Bitte überprüfe deine Eingaben.')).toBeInTheDocument();
  });

  it('should not show general validation error when there are no validation messages', async () => {
    render(ContactStep, {
      contactPerson: filledContact,
      finalDeadline,
      canEdit: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByText('Bitte überprüfe deine Eingaben.')).not.toBeInTheDocument();
  });

  it('should have all fields marked as required', async () => {
    render(ContactStep, {
      contactPerson: emptyContact,
      finalDeadline,
      canEdit: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByTestId('qa-contact-first-name')).toHaveAttribute('required');
    await expect.element(page.getByTestId('qa-contact-last-name')).toHaveAttribute('required');
    await expect.element(page.getByTestId('qa-contact-email')).toHaveAttribute('required');
    await expect.element(page.getByTestId('qa-contact-phone')).toHaveAttribute('required');
  });

  it('should have correct field types', async () => {
    render(ContactStep, {
      contactPerson: emptyContact,
      finalDeadline,
      canEdit: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByTestId('qa-contact-first-name')).toHaveAttribute('type', 'text');
    await expect.element(page.getByTestId('qa-contact-last-name')).toHaveAttribute('type', 'text');
    await expect.element(page.getByTestId('qa-contact-email')).toHaveAttribute('type', 'email');
    await expect.element(page.getByTestId('qa-contact-phone')).toHaveAttribute('type', 'tel');
  });

  it('should have correct maxlength attributes', async () => {
    render(ContactStep, {
      contactPerson: emptyContact,
      finalDeadline,
      canEdit: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect
      .element(page.getByTestId('qa-contact-first-name'))
      .toHaveAttribute('maxlength', '50');
    await expect
      .element(page.getByTestId('qa-contact-last-name'))
      .toHaveAttribute('maxlength', '50');
    await expect.element(page.getByTestId('qa-contact-email')).toHaveAttribute('maxlength', '100');
    await expect.element(page.getByTestId('qa-contact-phone')).toHaveAttribute('maxlength', '50');
  });

  it('should display validation messages for all fields including last_name and phone_number', async () => {
    const validationMessages = {
      'booking.contact_person.first_name': ['First name is required'],
      'booking.contact_person.last_name': ['Last name is required'],
      'booking.contact_person.email': ['Email is invalid'],
      'booking.contact_person.phone_number': ['Phone number is invalid'],
    };

    render(ContactStep, {
      contactPerson: emptyContact,
      finalDeadline,
      canEdit: true,
      validationMessages,
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByText('First name is required')).toBeInTheDocument();
    await expect.element(page.getByText('Last name is required')).toBeInTheDocument();
    await expect.element(page.getByText('Email is invalid')).toBeInTheDocument();
    await expect.element(page.getByText('Phone number is invalid')).toBeInTheDocument();
  });

  it('should sync local state when contactPerson prop changes', async () => {
    const { rerender } = render(ContactStep, {
      contactPerson: emptyContact,
      finalDeadline,
      canEdit: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    // Initial state should be empty
    await expect.element(page.getByTestId('qa-contact-first-name')).toHaveValue('');

    // Update props
    rerender({
      contactPerson: filledContact,
      finalDeadline,
      canEdit: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    // State should update to new props
    await expect.element(page.getByTestId('qa-contact-first-name')).toHaveValue('Max');
    await expect.element(page.getByTestId('qa-contact-last-name')).toHaveValue('Mustermann');
    await expect.element(page.getByTestId('qa-contact-email')).toHaveValue('max@example.com');
    await expect.element(page.getByTestId('qa-contact-phone')).toHaveValue('+49 123 456789');
  });
});
