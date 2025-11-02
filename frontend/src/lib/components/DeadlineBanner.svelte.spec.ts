import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DeadlineBanner from './DeadlineBanner.svelte';

describe('DeadlineBanner', () => {
  const routePlanningDeadline = new Date('2024-12-05T19:30:00+01:00');
  const finalDeadline = new Date('2024-12-20T23:59:00+01:00');

  it('should render both deadlines', async () => {
    render(DeadlineBanner, {
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
    });

    const routePlanningText = page.getByText('Adresse und Zeitslots:', { exact: false });
    const finalText = page.getByText('Finale Deadline:', { exact: false });

    await expect.element(routePlanningText).toBeInTheDocument();
    await expect.element(finalText).toBeInTheDocument();
  });

  it('should apply strikethrough when route planning deadline passed', async () => {
    const { container } = render(DeadlineBanner, {
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: false,
      canEditAnything: true,
    });

    const routePlanningElement = container.querySelector(
      '[data-testid="qa-deadline-route-planning"]',
    );
    expect(routePlanningElement?.classList.contains('line-through')).toBe(true);
    expect(routePlanningElement?.classList.contains('text-calypso-700')).toBe(true);
  });

  it('should apply strikethrough when final deadline passed', async () => {
    const { container } = render(DeadlineBanner, {
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: false,
      canEditAnything: false,
    });

    const finalElement = container.querySelector('[data-testid="qa-deadline-final"]');
    expect(finalElement?.classList.contains('line-through')).toBe(true);
    expect(finalElement?.classList.contains('text-calypso-700')).toBe(true);
  });

  it('should not apply strikethrough when deadlines are active', async () => {
    const { container } = render(DeadlineBanner, {
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
    });

    const routePlanningElement = container.querySelector(
      '[data-testid="qa-deadline-route-planning"]',
    );
    const finalElement = container.querySelector('[data-testid="qa-deadline-final"]');

    expect(routePlanningElement?.classList.contains('line-through')).toBe(false);
    expect(finalElement?.classList.contains('line-through')).toBe(false);
  });

  it('should display deadline explanation text', async () => {
    render(DeadlineBanner, {
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
    });

    const routePlanningExplanation = page.getByText('(wichtig für Routenplanung)');
    const finalExplanation = page.getByText('(für alle restlichen Angaben)');

    await expect.element(routePlanningExplanation).toBeInTheDocument();
    await expect.element(finalExplanation).toBeInTheDocument();
  });

  it('should render with correct test IDs', async () => {
    const { container } = render(DeadlineBanner, {
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
    });

    const banner = container.querySelector('[data-testid="qa-deadlines"]');
    const routePlanning = container.querySelector('[data-testid="qa-deadline-route-planning"]');
    const final = container.querySelector('[data-testid="qa-deadline-final"]');

    expect(banner).toBeTruthy();
    expect(routePlanning).toBeTruthy();
    expect(final).toBeTruthy();
  });

  it('should apply correct styling classes', async () => {
    const { container } = render(DeadlineBanner, {
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
    });

    const banner = container.querySelector('[data-testid="qa-deadlines"]');
    expect(banner?.classList.contains('text-calypso')).toBe(true);
    expect(banner?.classList.contains('mx-2')).toBe(true);
    expect(banner?.classList.contains('mt-4')).toBe(true);
  });
});
