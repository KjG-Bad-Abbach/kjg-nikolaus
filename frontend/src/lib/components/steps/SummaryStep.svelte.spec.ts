import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SummaryStep from './SummaryStep.svelte';

describe('SummaryStep', () => {
  const routePlanningDeadline = new Date('2024-12-01T19:30:00+01:00');
  const finalDeadline = new Date('2024-12-05T19:30:00+01:00');

  it('should render thank you heading', async () => {
    render(SummaryStep, {
      isRoutePlanningFilled: false,
      isEverythingFilled: false,
      routePlanningDeadline,
      finalDeadline,
    });

    await expect
      .element(page.getByRole('heading', { level: 2 }))
      .toHaveTextContent('Vielen Dank für deine Anmeldung.');
  });

  it('should show route complete message when route planning filled', async () => {
    render(SummaryStep, {
      isRoutePlanningFilled: true,
      isEverythingFilled: false,
      routePlanningDeadline,
      finalDeadline,
    });

    await expect.element(page.getByTestId('qa-summary-route-complete')).toBeInTheDocument();
    await expect
      .element(page.getByText('Für unsere Routenplanung haben wir nun alle Informationen.'))
      .toBeInTheDocument();
  });

  it('should show route missing message when route planning not filled', async () => {
    render(SummaryStep, {
      isRoutePlanningFilled: false,
      isEverythingFilled: false,
      routePlanningDeadline,
      finalDeadline,
    });

    await expect.element(page.getByTestId('qa-summary-route-missing')).toBeInTheDocument();
  });

  it('should show details missing message when not everything filled', async () => {
    render(SummaryStep, {
      isRoutePlanningFilled: true,
      isEverythingFilled: false,
      routePlanningDeadline,
      finalDeadline,
    });

    await expect.element(page.getByTestId('qa-summary-details-missing')).toBeInTheDocument();
  });

  it('should show completion message when everything filled', async () => {
    render(SummaryStep, {
      isRoutePlanningFilled: true,
      isEverythingFilled: true,
      routePlanningDeadline,
      finalDeadline,
    });

    await expect.element(page.getByTestId('qa-summary-all-complete')).toBeInTheDocument();
    await expect
      .element(page.getByText('Wir haben alle erforderlichen Informationen erhalten.'))
      .toBeInTheDocument();
  });

  it('should show checkmark when everything filled', async () => {
    render(SummaryStep, {
      isRoutePlanningFilled: true,
      isEverythingFilled: true,
      routePlanningDeadline,
      finalDeadline,
    });

    await expect.element(page.getByTestId('qa-summary-checkmark')).toBeInTheDocument();
  });

  it('should hide checkmark when not everything filled', async () => {
    render(SummaryStep, {
      isRoutePlanningFilled: true,
      isEverythingFilled: false,
      routePlanningDeadline,
      finalDeadline,
    });

    await expect.element(page.getByTestId('qa-summary-checkmark')).not.toBeInTheDocument();
  });

  it('should display informational messages', async () => {
    render(SummaryStep, {
      isRoutePlanningFilled: true,
      isEverythingFilled: true,
      routePlanningDeadline,
      finalDeadline,
    });

    await expect
      .element(page.getByText('Sobald wir die Routen geplant haben', { exact: false }))
      .toBeInTheDocument();
    await expect
      .element(page.getByText('Du kannst deine Angaben jederzeit', { exact: false }))
      .toBeInTheDocument();
  });
});
