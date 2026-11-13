import { page } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ChildrenStep from './ChildrenStep.svelte';
import type { Child } from '$lib/types/booking';

describe('ChildrenStep', () => {
  const finalDeadline = new Date('2024-12-05T19:30:00+01:00');

  afterEach(() => vi.restoreAllMocks());

  it('should render heading and instructions', async () => {
    render(ChildrenStep, {
      children: [],
      additionalNotes: '',
      finalDeadline,
      canEditAnything: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByRole('heading', { level: 2 })).toHaveTextContent('Kinder');
    await expect
      .element(page.getByText('Der Nikolaus erhält im Vorfeld', { exact: false }))
      .toBeInTheDocument();
  });

  it('should show warning when no children added', async () => {
    render(ChildrenStep, {
      children: [],
      additionalNotes: '',
      finalDeadline,
      canEditAnything: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect
      .element(page.getByText('Bitte füge mindestens ein Kind hinzu.'))
      .toBeInTheDocument();
  });

  it('should render child form fields', async () => {
    const children: Child[] = [
      { name: 'Max', identification_trait: '8 Jahre', speech: 'Test speech' },
    ];

    render(ChildrenStep, {
      children,
      additionalNotes: '',
      finalDeadline,
      canEditAnything: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByTestId('qa-child-name-0')).toHaveValue('Max');
    await expect.element(page.getByTestId('qa-child-identification-0')).toHaveValue('8 Jahre');
    await expect.element(page.getByTestId('qa-child-speech-0')).toHaveValue('Test speech');
  });

  it('should call onChange when child field changes', async () => {
    const onChange = vi.fn();
    const children: Child[] = [{ name: '', identification_trait: '', speech: '' }];

    render(ChildrenStep, {
      children,
      additionalNotes: '',
      finalDeadline,
      canEditAnything: true,
      validationMessages: {},
      onChange,
      onSubmit: vi.fn(),
    });

    const nameInput = page.getByTestId('qa-child-name-0');
    await nameInput.fill('Anna');

    expect(onChange).toHaveBeenCalled();
  });

  it('should call onChange when adding a child', async () => {
    // Arrange
    const onChange = vi.fn();

    render(ChildrenStep, {
      children: [],
      additionalNotes: '',
      finalDeadline,
      canEditAnything: true,
      validationMessages: {},
      onChange,
      onSubmit: vi.fn(),
    });

    const addButton = page.getByTestId('qa-add-child');
    // Act
    await addButton.click();

    // Assert
    expect(onChange).toHaveBeenCalled();
    const call = onChange.mock.calls[0][0];
    expect(call.children).toHaveLength(1);
    await expect
      .element(page.getByText('Bitte füge mindestens ein Kind hinzu.'))
      .not.toBeInTheDocument();
  });

  it('should call onChange when removing a child', async () => {
    // Arrange
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    const onChange = vi.fn();
    const children: Child[] = [
      { name: 'Max', identification_trait: '', speech: '' },
      { name: 'Anna', identification_trait: '', speech: '' },
    ];

    render(ChildrenStep, {
      children,
      additionalNotes: '',
      finalDeadline,
      canEditAnything: true,
      validationMessages: {},
      onChange,
      onSubmit: vi.fn(),
    });

    const removeButton = page.getByTestId('qa-remove-child-0');
    // Act
    await removeButton.click();

    // Assert
    expect(confirm).toHaveBeenCalledWith('Möchten Sie dieses Kind wirklich entfernen?');
    expect(onChange).toHaveBeenCalled();
    const call = onChange.mock.calls[0][0];
    expect(call.children).toHaveLength(1);
    expect(call.children[0].name).toBe('Anna');
  });

  it('removeChild_ConfirmationDeclined_Expect_NoChanges', async () => {
    // Arrange
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const onChange = vi.fn();
    render(ChildrenStep, {
      children: [{ name: 'Anna', identification_trait: '', speech: '' }],
      additionalNotes: '',
      finalDeadline,
      canEditAnything: true,
      validationMessages: {},
      onChange,
    });
    // Act
    await page.getByTestId('qa-remove-child-0').click();
    // Assert
    expect(onChange).not.toHaveBeenCalled();
    await expect.element(page.getByTestId('qa-child-name-0')).toHaveValue('Anna');
  });

  it.each([
    { children: [] },
    { children: [{ name: 'Anna', identification_trait: '', speech: '' }] },
  ])('handleSubmit_DeferredDetails$children_Expect_StructuredPayload', async ({ children }) => {
    // Arrange
    const onSubmit = vi.fn();
    render(ChildrenStep, {
      children,
      additionalNotes: 'Visit notes',
      finalDeadline,
      canEditAnything: true,
      validationMessages: {},
      onSubmit,
    });
    // Act
    await page.getByTestId('qa-children-submit').click();
    // Assert
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ children, additionalNotes: 'Visit notes' });
  });

  it('skip_UnsavedInvalidChild_Expect_NavigationWithoutSubmission', async () => {
    // Arrange
    const onSkip = vi.fn();
    const onSubmit = vi.fn();
    render(ChildrenStep, {
      children: [{ name: '', identification_trait: '', speech: '' }],
      additionalNotes: '',
      finalDeadline,
      canEditAnything: true,
      validationMessages: {},
      onSkip,
      onSubmit,
    });
    // Act
    await page.getByTestId('qa-children-skip').click();
    // Assert
    expect(onSkip).toHaveBeenCalledExactlyOnceWith();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('handleSubmit_BlankChildName_Expect_NativeValidation', async () => {
    // Arrange
    const onSubmit = vi.fn();
    render(ChildrenStep, {
      children: [{ name: '', identification_trait: '', speech: '' }],
      additionalNotes: '',
      finalDeadline,
      canEditAnything: true,
      validationMessages: {},
      onSubmit,
    });
    // Act
    await page.getByTestId('qa-children-submit').click();
    // Assert
    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      (page.getByTestId('qa-child-name-0').element() as HTMLInputElement).validity.valueMissing,
    ).toBe(true);
  });

  it('should render additional notes field', async () => {
    render(ChildrenStep, {
      children: [],
      additionalNotes: 'Hund bellen',
      finalDeadline,
      canEditAnything: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByTestId('qa-additional-notes')).toHaveValue('Hund bellen');
  });

  it('should show submit button when editable', async () => {
    render(ChildrenStep, {
      children: [],
      additionalNotes: '',
      finalDeadline,
      canEditAnything: true,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByTestId('qa-children-submit')).toBeInTheDocument();
  });

  it('should hide buttons when not editable', async () => {
    // Arrange
    const children: Child[] = [{ name: 'Max', identification_trait: '', speech: '' }];

    // Act
    render(ChildrenStep, {
      children,
      additionalNotes: '',
      finalDeadline,
      canEditAnything: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    // Assert
    await expect.element(page.getByTestId('qa-add-child')).not.toBeInTheDocument();
    await expect.element(page.getByTestId('qa-remove-child-0')).not.toBeInTheDocument();
    await expect.element(page.getByTestId('qa-children-submit')).not.toBeInTheDocument();
    await expect.element(page.getByTestId('qa-children-skip')).not.toBeInTheDocument();
  });

  it('ChildrenForm_ReadOnly_Expect_LockedFieldsWithoutTrailingControlSpacing', async () => {
    // Arrange
    const children: Child[] = [{ name: 'Max', identification_trait: '', speech: '' }];

    // Act
    render(ChildrenStep, {
      children,
      additionalNotes: '',
      finalDeadline,
      canEditAnything: false,
      validationMessages: {},
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    // Assert
    await expect.element(page.getByTestId('qa-child-name-0')).toHaveAttribute('readonly');
    await expect.element(page.getByTestId('qa-additional-notes')).toHaveAttribute('readonly');
    for (const [testId, marginBottom] of [
      ['qa-child-speech-0', '0px'],
      ['qa-additional-notes', '0px'],
    ]) {
      const field = page.getByTestId(testId).element().parentElement!;
      expect(getComputedStyle(field).marginBottom).toBe(marginBottom);
    }
  });

  it('should display validation messages for child fields', async () => {
    // Arrange
    const children: Child[] = [{ name: '', identification_trait: '', speech: '' }];
    const validationMessages = {
      'booking.children[0].name': ['Name ist erforderlich'],
      'booking.children[0].identification_trait': ['Bitte Merkmal angeben'],
      'booking.children[0].speech': ['Rede ist erforderlich'],
    };

    // Act
    render(ChildrenStep, {
      children,
      additionalNotes: '',
      finalDeadline,
      canEditAnything: true,
      validationMessages,
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    // Assert
    await expect.element(page.getByText('Name ist erforderlich')).toBeInTheDocument();
    await expect.element(page.getByText('Bitte Merkmal angeben')).toBeInTheDocument();
    await expect.element(page.getByText('Rede ist erforderlich')).toBeInTheDocument();
    await expect.element(page.getByText('Bitte überprüfe deine Eingaben.')).toBeInTheDocument();
  });

  it('should display validation message for additional notes', async () => {
    const validationMessages = {
      'booking.additional_notes': ['Hinweise zu lang'],
    };

    render(ChildrenStep, {
      children: [],
      additionalNotes: '',
      finalDeadline,
      canEditAnything: true,
      validationMessages,
      onChange: vi.fn(),
      onSubmit: vi.fn(),
    });

    await expect.element(page.getByText('Hinweise zu lang')).toBeInTheDocument();
  });
});
