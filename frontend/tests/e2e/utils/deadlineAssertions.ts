import { expect, Page } from "@playwright/test";

export const expectDeadlinesEditable = async (page: Page) => {
  const route = page.getByTestId("qa-deadline-route-planning");
  const final = page.getByTestId("qa-deadline-final");
  await expect(route).toBeVisible();
  await expect(final).toBeVisible();
  await expect(route).not.toHaveClass(/line-through/);
  await expect(final).not.toHaveClass(/line-through/);
};

export const expectDeadlinesLocked = async (page: Page) => {
  const route = page.getByTestId("qa-deadline-route-planning");
  const final = page.getByTestId("qa-deadline-final");
  await expect(route).toBeVisible();
  await expect(final).toBeVisible();
  await expect(route).toHaveClass(/line-through/);
  await expect(final).toHaveClass(/line-through/);
};
