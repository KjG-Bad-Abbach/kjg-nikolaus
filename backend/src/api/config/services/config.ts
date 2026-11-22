/**
 * config service
 */

import { factories } from "@strapi/strapi";

function readUrl(name: string): string | null {
  const value = process.env[name]?.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    if (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    ) {
      return value;
    }
  } catch {
    // Invalid deployment inputs must not prevent access to the setup UI.
  }
  return null;
}

function getPublicUrls(): {
  base_url: string | null;
  api_base_url: string | null;
} {
  return {
    base_url: readUrl("BASE_URL"),
    api_base_url: readUrl("API_BASE_URL"),
  };
}

export default factories.createCoreService("api::config.config", () => ({
  getPublicUrls,

  getBookingUrl(bookingId: string): string {
    const { base_url } = getPublicUrls();
    if (!base_url) {
      throw new Error(
        "Set BASE_URL to a valid public HTTP(S) URL in the backend environment, then restart before sending booking emails."
      );
    }
    return `${base_url.replace(/\/+$/, "")}/?id=${bookingId}`;
  },
}));
