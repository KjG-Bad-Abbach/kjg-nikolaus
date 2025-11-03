import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ChildrenSummary from './ChildrenSummary.svelte';
import type { Child } from '$lib/types/booking';

describe('ChildrenSummary', () => {
  const finalDeadline = new Date('2024-12-10T19:30:00+01:00');

  const completeChildren: Child[] = [
    {
      id: '1',
      name: 'Max',
      identification_trait: 'Blaue Augen',
      speech: 'Max war dieses Jahr besonders fleißig',
    },
    {
      id: '2',
      name: 'Emma',
      identification_trait: 'Blonde Haare',
      speech: 'Emma hat immer ihre Hausaufgaben gemacht',
    },
  ];

  it('should render with complete children information', async () => {
    render(ChildrenSummary, {
      children: completeChildren,
      additionalNotes: '',
      finalDeadline,
      onEdit: vi.fn(),
    });

    const heading = page.getByRole('heading', { level: 3 });
    await expect.element(heading).toHaveTextContent('Kinder');

    await expect.element(page.getByText('Max', { exact: true })).toBeInTheDocument();
    await expect.element(page.getByText('Blaue Augen', { exact: true })).toBeInTheDocument();
    await expect.element(page.getByText('Emma', { exact: true })).toBeInTheDocument();
    await expect.element(page.getByText('Blonde Haare', { exact: true })).toBeInTheDocument();
  });

  it('should show missing field warning for empty children list', async () => {
    render(ChildrenSummary, {
      children: [],
      additionalNotes: '',
      finalDeadline,
      onEdit: vi.fn(),
    });

    const warning = page.getByText('Angabe fehlt', { exact: false });
    await expect.element(warning).toBeInTheDocument();
    await expect.element(warning).toHaveClass(/italic/);
    await expect.element(warning).toHaveClass(/text-rust/);
  });

  it('should show missing field warnings for incomplete child data', async () => {
    const incompleteChildren: Child[] = [
      {
        id: '1',
        name: '',
        identification_trait: 'Blaue Augen',
        speech: '',
      },
    ];

    render(ChildrenSummary, {
      children: incompleteChildren,
      additionalNotes: '',
      finalDeadline,
      onEdit: vi.fn(),
    });

    const warnings = page.getByText('Angabe fehlt', { exact: false });
    await expect.element(warnings.nth(0)).toBeInTheDocument();
  });

  it('should display additional notes when provided', async () => {
    render(ChildrenSummary, {
      children: completeChildren,
      additionalNotes: 'Bitte klingeln Sie zweimal',
      finalDeadline,
      onEdit: vi.fn(),
    });

    await expect
      .element(page.getByText('Hinweise für den Nikolaus:', { exact: false }))
      .toBeInTheDocument();
    await expect
      .element(page.getByText('Bitte klingeln Sie zweimal', { exact: true }))
      .toBeInTheDocument();
  });

  it('should not display additional notes section when empty', async () => {
    render(ChildrenSummary, {
      children: completeChildren,
      additionalNotes: '',
      finalDeadline,
      onEdit: vi.fn(),
    });

    const notesLabel = page.getByText('Hinweise für den Nikolaus:', { exact: false });
    await expect.element(notesLabel).not.toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(ChildrenSummary, {
      children: completeChildren,
      additionalNotes: '',
      finalDeadline,
      onEdit,
    });

    const editButton = page.getByTitle('Bearbeiten');
    await editButton.click();

    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('should show all field labels correctly', async () => {
    render(ChildrenSummary, {
      children: completeChildren,
      additionalNotes: '',
      finalDeadline,
      onEdit: vi.fn(),
    });

    // Check that labels exist (there will be multiple since we have multiple children)
    await expect.element(page.getByText('Name:', { exact: false }).nth(0)).toBeInTheDocument();
    await expect.element(page.getByText('Merkmal:', { exact: false }).nth(0)).toBeInTheDocument();
    await expect.element(page.getByText('Rede:', { exact: false }).nth(0)).toBeInTheDocument();
  });

  it('should show deadline in warnings', async () => {
    render(ChildrenSummary, {
      children: [],
      additionalNotes: '',
      finalDeadline,
      onEdit: vi.fn(),
    });

    const deadline = page.getByText('Deadline:', { exact: false });
    await expect.element(deadline).toBeInTheDocument();
  });

  it('should truncate long speech text', async () => {
    const { container } = render(ChildrenSummary, {
      children: completeChildren,
      additionalNotes: '',
      finalDeadline,
      onEdit: vi.fn(),
    });

    const truncateDiv = container.querySelector('.truncate');
    expect(truncateDiv).toBeTruthy();
  });

  it('should handle multiple children correctly', async () => {
    render(ChildrenSummary, {
      children: completeChildren,
      additionalNotes: '',
      finalDeadline,
      onEdit: vi.fn(),
    });

    const list = page.getByRole('list');
    await expect.element(list).toBeInTheDocument();
  });

  it('should not show deadline warning for complete child fields', async () => {
    render(ChildrenSummary, {
      children: completeChildren,
      additionalNotes: '',
      finalDeadline,
      onEdit: vi.fn(),
    });

    // There should be no "Angabe fehlt" warnings for complete children
    const warnings = page.getByText('Angabe fehlt', { exact: false });
    await expect.element(warnings).not.toBeInTheDocument();
  });

  it('should truncate long additional notes', async () => {
    const { container } = render(ChildrenSummary, {
      children: completeChildren,
      additionalNotes:
        'This is a very long additional note that should be truncated when displayed in the UI',
      finalDeadline,
      onEdit: vi.fn(),
    });

    const truncateDiv = container.querySelectorAll('.truncate');
    // Should have truncate divs for speech + additional notes
    expect(truncateDiv.length).toBeGreaterThan(0);
  });

  it('should handle child with empty string fields', async () => {
    const childWithEmptyStrings: Child[] = [
      {
        id: '1',
        name: '',
        identification_trait: '',
        speech: '',
      },
    ];

    render(ChildrenSummary, {
      children: childWithEmptyStrings,
      additionalNotes: '',
      finalDeadline,
      onEdit: vi.fn(),
    });

    // Should show warnings for all empty fields
    const warnings = page.getByText('Angabe fehlt', { exact: false });
    await expect.element(warnings.nth(0)).toBeInTheDocument();
  });
});
