import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import DeadlineBanner from './DeadlineBanner.svelte';

describe('DeadlineBanner', () => {
  const routePlanningDeadline = new Date('2024-12-05T19:30:00+01:00');
  const finalDeadline = new Date('2024-12-20T23:59:00+01:00');

  it('should render both deadlines with explanation text', async () => {
    render(DeadlineBanner, {
      routePlanningDeadline,
      finalDeadline,
      canEditRoutePlanning: true,
      canEditAnything: true,
    });

    await expect
      .element(page.getByText('Adresse und Zeitslots:', { exact: false }))
      .toBeInTheDocument();
    await expect.element(page.getByText('Finale Deadline:', { exact: false })).toBeInTheDocument();
    await expect.element(page.getByText('(wichtig für Routenplanung)')).toBeInTheDocument();
    await expect.element(page.getByText('(für alle restlichen Angaben)')).toBeInTheDocument();
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
});
