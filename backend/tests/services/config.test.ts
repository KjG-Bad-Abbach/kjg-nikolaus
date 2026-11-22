import type { Core } from "@strapi/strapi";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import createConfigService from "@/api/config/services/config";

vi.mock("@strapi/strapi", () => ({
  factories: {
    createCoreService: (_uid: string, extension: unknown) => extension,
  },
}));

beforeEach(() => {
  vi.stubEnv("BASE_URL", "");
  vi.stubEnv("API_BASE_URL", "");
});

afterEach(() => vi.unstubAllEnvs());

describe("getPublicUrls", () => {
  it("getPublicUrls_ChangedEnvironment_Expect_CurrentNormalizedUrls", () => {
    // Arrange
    const service = createConfigService({ strapi: {} as Core.Strapi });
    vi.stubEnv("BASE_URL", "https://old.example.org");
    vi.stubEnv("API_BASE_URL", "https://old-api.example.org");
    expect(service.getPublicUrls()).toEqual({
      base_url: "https://old.example.org",
      api_base_url: "https://old-api.example.org",
    });

    // Act
    vi.stubEnv("BASE_URL", " https://booking.example.org/visits/ ");
    vi.stubEnv("API_BASE_URL", " https://api.example.org ");
    const urls = service.getPublicUrls();

    // Assert
    expect(urls).toEqual({
      base_url: "https://booking.example.org/visits/",
      api_base_url: "https://api.example.org",
    });
  });

  it.each([
    ...[
      "",
      "not-a-url",
      "ftp://example.org",
      "https://user:password@example.org",
    ].map((value) => ({
      baseUrl: value,
      apiBaseUrl: value,
      expected: { base_url: null, api_base_url: null },
    })),
    {
      baseUrl: "https://booking.example.org",
      apiBaseUrl: "",
      expected: { base_url: "https://booking.example.org", api_base_url: null },
    },
    {
      baseUrl: "not-a-url",
      apiBaseUrl: "https://api.example.org",
      expected: { base_url: null, api_base_url: "https://api.example.org" },
    },
  ])(
    "getPublicUrls_Environment%j_Expect_IndependentValidatedFields",
    ({ baseUrl, apiBaseUrl, expected }) => {
      // Arrange
      const service = createConfigService({ strapi: {} as Core.Strapi });
      vi.stubEnv("BASE_URL", baseUrl);
      vi.stubEnv("API_BASE_URL", apiBaseUrl);

      // Act
      const urls = service.getPublicUrls();

      // Assert
      expect(urls).toEqual(expected);
    }
  );
});

describe("getBookingUrl", () => {
  it("getBookingUrl_MissingBaseUrl_Expect_ActionableError", () => {
    // Arrange
    const service = createConfigService({ strapi: {} as Core.Strapi });

    // Act
    const getUrl = () => service.getBookingUrl("booking-document");

    // Assert
    expect(getUrl).toThrow(
      "Set BASE_URL to a valid public HTTP(S) URL in the backend environment, then restart"
    );
  });
});
