import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import AddressStep from './AddressStep.svelte';
import type { Location } from '$lib/types/booking';

describe('AddressStep', () => {
  const routePlanningDeadline = new Date('2024-12-01T19:30:00+01:00');
  const finalDeadline = new Date('2024-12-05T19:30:00+01:00');

  const emptyLocation: Location = {
    street: '',
    house_number: '',
    zip_code: '',
    place: '',
  };

  const filledLocation: Location = {
    street: 'Musterstraße',
    house_number: '42',
    zip_code: '12345',
    place: 'Musterstadt',
  };

  it('should render form with all fields', async () => {
    render(AddressStep, {
      location: emptyLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const heading = page.getByRole('heading', { level: 2 });
    await expect.element(heading).toHaveTextContent('Adresse und Ort für Geschenke');

    // Check all fields are present
    await expect.element(page.getByTestId('qa-address-street')).toBeInTheDocument();
    await expect.element(page.getByTestId('qa-address-house-number')).toBeInTheDocument();
    await expect.element(page.getByTestId('qa-address-zip')).toBeInTheDocument();
    await expect.element(page.getByTestId('qa-address-place')).toBeInTheDocument();
    await expect.element(page.getByTestId('qa-address-present-location')).toBeInTheDocument();
  });

  it('should display route planning deadline notice', async () => {
    render(AddressStep, {
      location: emptyLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const deadlineText = page.getByText('Hinweis: Deadline für diese Angaben', {
      exact: false,
    });
    await expect.element(deadlineText).toBeInTheDocument();
  });

  it('should show warning when route planning editing is disabled', async () => {
    render(AddressStep, {
      location: emptyLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: false,
      canEditAnything: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const warning = page.getByText(
      'Nach der Deadline können die Angaben nicht mehr bearbeitet werden',
      { exact: false },
    );
    await expect.element(warning).toBeInTheDocument();
  });

  it('should populate address fields with location data', async () => {
    render(AddressStep, {
      location: filledLocation,
      presentLocation: 'In der Garage',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByTestId('qa-address-street')).toHaveValue('Musterstraße');
    await expect.element(page.getByTestId('qa-address-house-number')).toHaveValue('42');
    await expect.element(page.getByTestId('qa-address-zip')).toHaveValue(12345);
    await expect.element(page.getByTestId('qa-address-place')).toHaveValue('Musterstadt');
    await expect
      .element(page.getByTestId('qa-address-present-location'))
      .toHaveValue('In der Garage');
  });

  it('should make address fields readonly when canEditRoutePlanning is false', async () => {
    render(AddressStep, {
      location: filledLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: false,
      canEditAnything: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByTestId('qa-address-street')).toHaveAttribute('readonly');
    await expect.element(page.getByTestId('qa-address-house-number')).toHaveAttribute('readonly');
    await expect.element(page.getByTestId('qa-address-zip')).toHaveAttribute('readonly');
    await expect.element(page.getByTestId('qa-address-place')).toHaveAttribute('readonly');
  });

  it('should make present location readonly when canEditAnything is false', async () => {
    render(AddressStep, {
      location: filledLocation,
      presentLocation: 'In der Garage',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect
      .element(page.getByTestId('qa-address-present-location'))
      .toHaveAttribute('readonly');
  });

  it('should call onChange when input values change', async () => {
    const onChange = vi.fn();
    render(AddressStep, {
      location: emptyLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages: {},
      onChange,
      onSubmit: vi.fn(),
    });

    const streetInput = page.getByTestId('qa-address-street');
    await streetInput.fill('Neue Straße');

    expect(onChange).toHaveBeenCalled();
    const call = onChange.mock.calls[0][0];
    expect(call.location.street).toBe('Neue Straße');
  });

  it('should call onChange when present location changes', async () => {
    const onChange = vi.fn();
    render(AddressStep, {
      location: filledLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages: {},
      onChange,
      onSubmit: vi.fn(),
    });

    const presentLocationInput = page.getByTestId('qa-address-present-location');
    await presentLocationInput.fill('In der Garage');

    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(lastCall.presentLocation).toBe('In der Garage');
  });

  it('should display validation messages for address fields', async () => {
    const validationMessages = {
      'booking.location.street': ['Straße ist erforderlich'],
      'booking.location.place': ['Ort ist ungültig'],
    };

    render(AddressStep, {
      location: emptyLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages,
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByText('Straße ist erforderlich')).toBeInTheDocument();
    await expect.element(page.getByText('Ort ist ungültig')).toBeInTheDocument();
  });

  it('should display validation message for present location', async () => {
    const validationMessages = {
      'booking.present_location': ['Bitte genauere Angabe'],
    };

    render(AddressStep, {
      location: filledLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages,
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByText('Bitte genauere Angabe')).toBeInTheDocument();
  });

  it('should show submit button when canEditAnything is true', async () => {
    render(AddressStep, {
      location: filledLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const submitButton = page.getByTestId('qa-address-submit');
    await expect.element(submitButton).toBeInTheDocument();
    await expect.element(submitButton).toHaveTextContent('Speichern & Weiter');
  });

  it('should hide submit button when canEditAnything is false', async () => {
    render(AddressStep, {
      location: filledLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: false,
      canEditAnything: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    const submitButton = page.getByTestId('qa-address-submit');
    await expect.element(submitButton).not.toBeInTheDocument();
  });

  it('should call onSubmit when form is submitted', async () => {
    const onSubmit = vi.fn();
    render(AddressStep, {
      location: filledLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit,
    });

    const submitButton = page.getByTestId('qa-address-submit');
    await submitButton.click();

    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('should show general validation error when there are validation messages', async () => {
    const validationMessages = {
      'booking.location.street': ['Error 1'],
    };

    render(AddressStep, {
      location: emptyLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages,
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByText('Bitte überprüfe deine Eingaben.')).toBeInTheDocument();
  });

  it('should have address fields marked as required', async () => {
    render(AddressStep, {
      location: emptyLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByTestId('qa-address-street')).toHaveAttribute('required');
    await expect.element(page.getByTestId('qa-address-house-number')).toHaveAttribute('required');
    await expect.element(page.getByTestId('qa-address-zip')).toHaveAttribute('required');
    await expect.element(page.getByTestId('qa-address-place')).toHaveAttribute('required');
  });

  it('should NOT have present location marked as required', async () => {
    render(AddressStep, {
      location: emptyLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect
      .element(page.getByTestId('qa-address-present-location'))
      .not.toHaveAttribute('required');
  });

  it('should display examples for present location', async () => {
    render(AddressStep, {
      location: emptyLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect
      .element(page.getByText('Geschenke hinter der Papiertonne', { exact: false }))
      .toBeInTheDocument();
  });

  it('should have correct field types', async () => {
    render(AddressStep, {
      location: emptyLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByTestId('qa-address-street')).toHaveAttribute('type', 'text');
    await expect
      .element(page.getByTestId('qa-address-house-number'))
      .toHaveAttribute('type', 'text');
    await expect.element(page.getByTestId('qa-address-zip')).toHaveAttribute('type', 'number');
    await expect.element(page.getByTestId('qa-address-place')).toHaveAttribute('type', 'text');
    await expect
      .element(page.getByTestId('qa-address-present-location'))
      .toHaveAttribute('type', 'text');
  });

  it('should have correct maxlength attributes', async () => {
    render(AddressStep, {
      location: emptyLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByTestId('qa-address-street')).toHaveAttribute('maxlength', '100');
    await expect
      .element(page.getByTestId('qa-address-house-number'))
      .toHaveAttribute('maxlength', '10');
    await expect.element(page.getByTestId('qa-address-place')).toHaveAttribute('maxlength', '100');
    await expect
      .element(page.getByTestId('qa-address-present-location'))
      .toHaveAttribute('maxlength', '200');
  });

  it('should display validation messages for house_number and zip_code', async () => {
    const validationMessages = {
      'booking.location.house_number': ['Hausnummer ist erforderlich'],
      'booking.location.zip_code': ['PLZ ist ungültig'],
    };

    render(AddressStep, {
      location: emptyLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages,
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByText('Hausnummer ist erforderlich')).toBeInTheDocument();
    await expect.element(page.getByText('PLZ ist ungültig')).toBeInTheDocument();
  });

  it('should allow zip code input with 5 digits', async () => {
    const onChange = vi.fn();
    render(AddressStep, {
      location: emptyLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages: {},
      onChange,
      onSubmit: vi.fn(),
    });

    const zipInput = page.getByTestId('qa-address-zip');
    await zipInput.fill('12345');

    await expect.element(zipInput).toHaveValue(12345);
  });

  it('should limit zip code input to 5 digits', async () => {
    const onChange = vi.fn();
    render(AddressStep, {
      location: emptyLocation,
      presentLocation: '',
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
      validationMessages: {},
      onChange,
      onSubmit: vi.fn(),
    });

    const zipInput = page.getByTestId('qa-address-zip');
    zipInput.element().setAttribute('max', '999999999'); // Ensure input allows more than 5 digits for test
    await zipInput.fill('123456789');

    // Should be truncated to 5 digits
    await expect.element(zipInput).toHaveValue(12345);
  });
});
