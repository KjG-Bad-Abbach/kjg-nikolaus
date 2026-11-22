import type { Core } from "@strapi/strapi";
import { afterEach, describe, expect, it, vi } from "vitest";
import createConfigController from "@/api/config/controllers/config";
import createConfigService from "@/api/config/services/config";

vi.mock("@strapi/strapi", () => ({
  factories: {
    createCoreController: (_uid: string, extension: unknown) => extension,
    createCoreService: (_uid: string, extension: unknown) => extension,
  },
}));

function createHarness(config: Record<string, unknown> | null) {
  const service = createConfigService({ strapi: {} as Core.Strapi });
  const strapi = { service: vi.fn(() => service) };
  const core = {
    find: vi.fn(async () => ({
      data: config ? { ...config } : null,
      meta: { preserved: true },
    })),
  };
  const controller = createConfigController({
    strapi: strapi as unknown as Core.Strapi,
  });
  Object.setPrototypeOf(controller, core);
  return { controller, core };
}

afterEach(() => vi.unstubAllEnvs());

describe("find", () => {
  it.each([
    ["https://booking.example.org", "https://api.example.org"],
    ["", ""],
  ])(
    "find_EnvironmentUrls_Expect_NoDatabaseFallback",
    async (baseUrl, apiBaseUrl) => {
      // Arrange
      const config = {
        api_token: "existing-browser-token",
        base_url: "https://ignored-database.example.org",
        api_base_url: "https://ignored-database-api.example.org",
        max_time_slots: 3,
      };
      const { controller, core } = createHarness(config);
      vi.stubEnv("BASE_URL", baseUrl);
      vi.stubEnv("API_BASE_URL", apiBaseUrl);
      const ctx = {};

      // Act
      const response = await controller.find(ctx);

      // Assert
      expect(core.find).toHaveBeenCalledExactlyOnceWith(ctx);
      expect(response).toEqual({
        data: {
          ...config,
          base_url: baseUrl || null,
          api_base_url: apiBaseUrl || null,
        },
        meta: { preserved: true },
      });
      expect(config.base_url).toBe("https://ignored-database.example.org");
      expect(config.api_base_url).toBe(
        "https://ignored-database-api.example.org"
      );
    }
  );

  it("find_ChangedEnvironment_Expect_NewUrlsInResponse", async () => {
    // Arrange
    const { controller } = createHarness({
      api_token: "existing-browser-token",
    });
    vi.stubEnv("BASE_URL", "https://old.example.org");
    vi.stubEnv("API_BASE_URL", "https://old-api.example.org");
    await controller.find({});

    // Act
    vi.stubEnv("BASE_URL", "https://new.example.org");
    vi.stubEnv("API_BASE_URL", "https://new-api.example.org");
    const response = await controller.find({});

    // Assert
    expect(response.data).toMatchObject({
      base_url: "https://new.example.org",
      api_base_url: "https://new-api.example.org",
    });
  });

  it("find_MissingConfig_Expect_CoreEmptyResponsePreserved", async () => {
    // Arrange
    const { controller } = createHarness(null);

    // Act
    const response = await controller.find({});

    // Assert
    expect(response).toEqual({ data: null, meta: { preserved: true } });
  });
});
