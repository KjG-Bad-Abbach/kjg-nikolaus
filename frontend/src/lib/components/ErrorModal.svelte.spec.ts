import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ErrorModal from './ErrorModal.svelte';

describe('ErrorModal', () => {
  const error = {
    message: 'Something went wrong',
    status: { code: 500, text: 'Internal Server Error' },
    body: { error: 'Details here' },
  };

  it('should render error modal when error is provided', async () => {
    render(ErrorModal, { error, onClose: vi.fn() });

    const modal = page.getByRole('alert');
    await expect.element(modal).toBeInTheDocument();
  });

  it('should not render when error is null', async () => {
    const { container } = render(ErrorModal, { error: null, onClose: vi.fn() });

    const modal = container.querySelector('[data-testid="qa-error-modal"]');
    expect(modal).toBeFalsy();
  });

  it('should display error message', async () => {
    render(ErrorModal, { error, onClose: vi.fn() });

    const message = page.getByText('Something went wrong');
    await expect.element(message).toBeInTheDocument();
  });

  it('should show dismiss button when askToReload is false', async () => {
    render(ErrorModal, { error, onClose: vi.fn(), askToReload: false });

    const dismissButton = page.getByTestId('qa-error-dismiss');
    await expect.element(dismissButton).toBeInTheDocument();
  });

  it('should show retry button when askToReload is true', async () => {
    render(ErrorModal, { error, onClose: vi.fn(), onRetry: vi.fn(), askToReload: true });

    const retryButton = page.getByTestId('qa-error-retry');
    await expect.element(retryButton).toBeInTheDocument();
  });

  it('should call onClose when dismiss button clicked', async () => {
    const onClose = vi.fn();
    render(ErrorModal, { error, onClose, askToReload: false });

    const dismissButton = page.getByTestId('qa-error-dismiss');
    await dismissButton.click();

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should call onRetry when retry button clicked', async () => {
    const onRetry = vi.fn();
    render(ErrorModal, { error, onClose: vi.fn(), onRetry, askToReload: true });

    const retryButton = page.getByTestId('qa-error-retry');
    await retryButton.click();

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('should call onClose when clicking backdrop', async () => {
    const onClose = vi.fn();
    const { container } = render(ErrorModal, { error, onClose, askToReload: false });

    const backdrop = container.querySelector('.fixed.inset-0');
    // Simulate click where target === currentTarget (clicking the backdrop itself)
    const clickEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', { value: backdrop, configurable: true });
    Object.defineProperty(clickEvent, 'currentTarget', { value: backdrop, configurable: true });
    await backdrop?.dispatchEvent(clickEvent);

    expect(onClose).toHaveBeenCalled();
  });

  it('should not call onClose when clicking modal content', async () => {
    const onClose = vi.fn();
    const { container } = render(ErrorModal, { error, onClose, askToReload: false });

    const modal = container.querySelector('[data-testid="qa-error-modal"]');
    // Simulate click on modal content (target !== currentTarget)
    const clickEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', { value: modal, configurable: true });
    Object.defineProperty(clickEvent, 'currentTarget', {
      value: container.querySelector('.fixed.inset-0'),
      configurable: true,
    });
    await modal?.dispatchEvent(clickEvent);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('should call onClose when pressing key on backdrop', async () => {
    const onClose = vi.fn();
    const { container } = render(ErrorModal, { error, onClose, askToReload: false });

    const backdrop = container.querySelector('.fixed.inset-0');
    // Simulate keydown event where target === currentTarget
    const keyEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    Object.defineProperty(keyEvent, 'target', { value: backdrop, configurable: true });
    Object.defineProperty(keyEvent, 'currentTarget', { value: backdrop, configurable: true });
    await backdrop?.dispatchEvent(keyEvent);

    expect(onClose).toHaveBeenCalled();
  });

  it('should show details toggle when status or body present', async () => {
    render(ErrorModal, { error, onClose: vi.fn() });

    const detailsToggle = page.getByTestId('qa-error-details-toggle');
    await expect.element(detailsToggle).toBeInTheDocument();
  });

  it('should not show details toggle when no status or body', async () => {
    const simpleError = { message: 'Simple error' };
    const { container } = render(ErrorModal, { error: simpleError, onClose: vi.fn() });

    const detailsToggle = container.querySelector('[data-testid="qa-error-details-toggle"]');
    expect(detailsToggle).toBeFalsy();
  });

  it('should toggle details open when clicking details button', async () => {
    render(ErrorModal, { error, onClose: vi.fn() });

    const detailsToggle = page.getByTestId('qa-error-details-toggle');

    // Initially details should not be visible
    let statusText = page.getByText('Status:', { exact: false });
    await expect.element(statusText).not.toBeInTheDocument();

    // Click to open details
    await detailsToggle.click();

    // Now details should be visible
    statusText = page.getByText('Status:', { exact: false });
    await expect.element(statusText).toBeInTheDocument();
  });

  it('should display status code when details are open', async () => {
    render(ErrorModal, { error, onClose: vi.fn() });

    const detailsToggle = page.getByTestId('qa-error-details-toggle');
    await detailsToggle.click();

    const statusCode = page.getByText('500', { exact: false });
    const statusText = page.getByText('Internal Server Error', { exact: false });

    await expect.element(statusCode).toBeInTheDocument();
    await expect.element(statusText).toBeInTheDocument();
  });

  it('should display body JSON when details are open', async () => {
    render(ErrorModal, { error, onClose: vi.fn() });

    const detailsToggle = page.getByTestId('qa-error-details-toggle');
    await detailsToggle.click();

    const bodyContent = page.getByText('"error"', { exact: false });
    await expect.element(bodyContent).toBeInTheDocument();
  });

  it('should toggle details closed when clicking button again', async () => {
    render(ErrorModal, { error, onClose: vi.fn() });

    const detailsToggle = page.getByTestId('qa-error-details-toggle');

    // Open details
    await detailsToggle.click();
    let statusText = page.getByText('Status:', { exact: false });
    await expect.element(statusText).toBeInTheDocument();

    // Close details
    await detailsToggle.click();
    statusText = page.getByText('Status:', { exact: false });
    await expect.element(statusText).not.toBeInTheDocument();
  });

  it('should apply font-bold class when details are open', async () => {
    const { container } = render(ErrorModal, { error, onClose: vi.fn() });

    const detailsToggle = container.querySelector('[data-testid="qa-error-details-toggle"]');

    // Initially not bold
    expect(detailsToggle?.classList.contains('font-bold')).toBe(false);

    // Click to open
    const toggleButton = page.getByTestId('qa-error-details-toggle');
    await toggleButton.click();

    // Should now be bold
    expect(detailsToggle?.classList.contains('font-bold')).toBe(true);
  });

  it('should show only status when body is not present', async () => {
    const errorWithStatusOnly = {
      message: 'Server error',
      status: { code: 500, text: 'Internal Server Error' },
    };
    render(ErrorModal, { error: errorWithStatusOnly, onClose: vi.fn() });

    const detailsToggle = page.getByTestId('qa-error-details-toggle');
    await detailsToggle.click();

    const statusText = page.getByText('Status:', { exact: false });
    await expect.element(statusText).toBeInTheDocument();
  });

  it('should show only body when status is not present', async () => {
    const errorWithBodyOnly = {
      message: 'Request failed',
      body: { error: 'Details here' },
    };
    render(ErrorModal, { error: errorWithBodyOnly, onClose: vi.fn() });

    const detailsToggle = page.getByTestId('qa-error-details-toggle');
    await detailsToggle.click();

    const bodyContent = page.getByText('"error"', { exact: false });
    await expect.element(bodyContent).toBeInTheDocument();
  });

  it('should transition from null to error state', async () => {
    const { container, rerender } = render(ErrorModal, { error: null, onClose: vi.fn() });

    expect(container.querySelector('[data-testid="qa-error-modal"]')).toBeFalsy();

    // Simulate error occurring
    await rerender({ error, onClose: vi.fn() });

    const modal = page.getByRole('alert');
    await expect.element(modal).toBeInTheDocument();
  });
});
