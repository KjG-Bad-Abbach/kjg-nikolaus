import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import SummaryCard from './SummaryCard.svelte';

describe('SummaryCard', () => {
  it('should render with title and edit button', async () => {
    const onEdit = vi.fn();
    render(SummaryCard, {
      title: 'Test Title',
      onEdit,
    });

    const heading = page.getByRole('heading', { level: 3 });
    await expect.element(heading).toBeInTheDocument();
    await expect.element(heading).toHaveTextContent('Test Title');

    const editButton = page.getByTitle('Bearbeiten');
    await expect.element(editButton).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(SummaryCard, {
      title: 'Test Title',
      onEdit,
    });

    const editButton = page.getByTitle('Bearbeiten');
    await editButton.click();

    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('should render slot content', async () => {
    render(SummaryCard, {
      title: 'Test Title',
      onEdit: vi.fn(),
      children: createRawSnippet(() => ({
        render: () => '<p data-testid="custom-content">Custom Content</p>',
      })),
    });

    const content = page.getByTestId('custom-content');
    await expect.element(content).toBeInTheDocument();
    await expect.element(content).toHaveTextContent('Custom Content');
  });

  it('should call onEdit when Enter key is pressed on edit button', async () => {
    const onEdit = vi.fn();
    const { container } = render(SummaryCard, {
      title: 'Test Title',
      onEdit,
    });

    const editButton = container.querySelector('[role="button"]') as HTMLElement;
    const keyEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    await editButton.dispatchEvent(keyEvent);

    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('should call onEdit when Space key is pressed on edit button', async () => {
    const onEdit = vi.fn();
    const { container } = render(SummaryCard, {
      title: 'Test Title',
      onEdit,
    });

    const editButton = container.querySelector('[role="button"]') as HTMLElement;
    const keyEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
    const preventDefaultSpy = vi.spyOn(keyEvent, 'preventDefault');
    await editButton.dispatchEvent(keyEvent);

    expect(onEdit).toHaveBeenCalledOnce();
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should not call onEdit when other keys are pressed on edit button', async () => {
    const onEdit = vi.fn();
    const { container } = render(SummaryCard, {
      title: 'Test Title',
      onEdit,
    });

    const editButton = container.querySelector('[role="button"]') as HTMLElement;
    const keyEvent = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
    await editButton.dispatchEvent(keyEvent);

    expect(onEdit).not.toHaveBeenCalled();
  });

  it('should have keyboard accessibility attributes', async () => {
    const { container } = render(SummaryCard, {
      title: 'Test Title',
      onEdit: vi.fn(),
    });

    const editButton = container.querySelector('[role="button"]');
    expect(editButton).toBeTruthy();
    expect(editButton?.getAttribute('tabindex')).toBe('0');
  });
});
