import type { Core } from "@strapi/strapi";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import lifecycle from "../src/index";
import createConfigService from "@/api/config/services/config";
import { ParameterReplacer } from "@/utils/ParameterReplacer";
import { RichTextBlocksToHtmlRenderer } from "@/utils/RichTextBlocksToHtmlRenderer";
import { RichTextBlocksToMarkdownRenderer } from "@/utils/RichTextBlocksToMarkdownRenderer";
import defaultEmailTemplates from "@/locales/de.json";

vi.mock("@strapi/strapi", () => ({
  factories: {
    createCoreService: (_uid: string, extension: unknown) => extension,
  },
}));

const EXPECTED_PERMISSIONS = [
  "api::config.config.find",
  "api::booking.booking.sendVerificationEmail",
  "api::booking.booking.create",
  "api::booking.booking.update",
  "api::booking.booking.findOne",
  "api::time-slot.time-slot.find",
  "api::time-slot.time-slot.findOne",
];

const ENV_URLS = {
  base_url: "https://booking.example.org/path/",
  api_base_url: "https://api.example.org",
};

const CUSTOM_CONFIRMATION_BODY = [
  {
    type: "paragraph",
    children: [{ type: "text", text: "Custom confirmation body" }],
  },
];

function createHarness() {
  let config: Record<string, unknown> | null = null;
  const roleRows = [
    { id: 2, type: "authenticated" },
    { id: 1, type: "public" },
  ];
  const permissionRows: { id: number; action: string; role: number }[] = [];
  const configs = {
    findFirst: vi.fn(async () => config),
    create: vi.fn(async ({ data }) => {
      config = {
        documentId: "config-document",
        ...data,
      };
      return config;
    }),
    update: vi.fn(async ({ data }) => {
      config = { ...config, ...data };
      return config;
    }),
  };
  const roles = {
    findOne: vi.fn(
      async ({ where }) =>
        roleRows.find((role) =>
          Object.entries(where).every(([field, value]) => role[field] === value)
        ) ?? null
    ),
  };
  const permissions = {
    findOne: vi.fn(
      async ({ where }) =>
        permissionRows.find((permission) =>
          Object.entries(where).every(
            ([field, value]) => permission[field] === value
          )
        ) ?? null
    ),
    create: vi.fn(async ({ data }) => {
      const permission = { id: permissionRows.length + 1, ...data };
      permissionRows.push(permission);
      return permission;
    }),
  };
  const tokens = {
    getByName: vi.fn(async (): Promise<{ id: number } | null> => null),
    create: vi.fn(async () => ({ accessKey: "browser-public-test-token" })),
  };
  const timeSlots = { count: vi.fn(async () => 0) };
  const warn = vi.fn();
  const configService = createConfigService({ strapi: {} as Core.Strapi });
  const strapi = {
    documents: (uid: string) =>
      uid === "api::config.config" ? configs : timeSlots,
    service: vi.fn(
      (uid: string) =>
        ({
          "admin::api-token-content-api": tokens,
          "api::config.config": configService,
        })[uid]
    ),
    db: {
      transaction: vi.fn(async (callback) => callback()),
      query: (uid: string) =>
        ({
          "plugin::users-permissions.role": roles,
          "plugin::users-permissions.permission": permissions,
        })[uid],
    },
    log: { warn },
  } as unknown as Core.Strapi;

  return {
    strapi,
    configs,
    permissions,
    permissionRows,
    tokens,
    timeSlots,
    warn,
  };
}

beforeEach(() => {
  vi.stubEnv("BASE_URL", "");
  vi.stubEnv("API_BASE_URL", "");
});

afterEach(() => vi.unstubAllEnvs());

describe("bootstrap", () => {
  it.each([{ base_url: "", api_base_url: "" }, ENV_URLS])(
    "bootstrap_EmptyDatabaseUrls%j_Expect_MinimalTokenWithoutStoredUrls",
    async (urls) => {
      // Arrange
      const { strapi, configs, permissions, tokens, warn } = createHarness();
      vi.stubEnv("BASE_URL", urls.base_url);
      vi.stubEnv("API_BASE_URL", urls.api_base_url);
      const bookingUrl = "https://booking.example.org/?id=booking-document";

      // Act
      await lifecycle.bootstrap({ strapi });
      const config = await configs.findFirst();
      const confirmationBody = ParameterReplacer(
        config.confirmation_email_body_template,
        {
          first_name: "Alex",
          last_name: "Example",
          button: () => bookingUrl,
        }
      );
      const renderedBodies = [
        new RichTextBlocksToHtmlRenderer(confirmationBody).render(),
        new RichTextBlocksToMarkdownRenderer(confirmationBody, {
          escape: "lacy",
        }).render(),
      ];

      // Assert
      expect(strapi.service).toHaveBeenCalledWith(
        "admin::api-token-content-api"
      );
      expect(tokens.create).toHaveBeenCalledExactlyOnceWith({
        name: "Booking frontend",
        description: "Browser-public token for the booking frontend",
        type: "custom",
        lifespan: null,
        permissions: EXPECTED_PERMISSIONS,
      });
      expect(configs.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          api_token: "browser-public-test-token",
          max_time_slots: 3,
          show_search_for_time_slots: false,
          confirmation_email_subject_template: "Buchungsbestätigung",
          confirmation_email_body_template:
            defaultEmailTemplates.confirmation_email_body_template,
          verification_email_subject_template:
            "E-Mail verifiziert - Vervollständige deine Buchung",
          verification_email_body_template: expect.arrayContaining([
            {
              type: "paragraph",
              children: [
                {
                  type: "text",
                  text: "{{button('Buchung vervollständigen/bearbeiten')}}",
                },
              ],
            },
          ]),
        }),
      });
      expect(config.route_planning_deadline).toBeUndefined();
      expect(config.final_deadline).toBeUndefined();
      for (const renderedBody of renderedBodies) {
        expect(renderedBody).toContain("Alex Example");
        expect(renderedBody).toContain(bookingUrl);
        expect(renderedBody).not.toContain("{{");
      }
      for (const field of ["base_url", "api_base_url"]) {
        expect(configs.create.mock.calls[0][0].data).not.toHaveProperty(field);
        expect(config).not.toHaveProperty(field);
      }
      expect(permissions.create).toHaveBeenCalledExactlyOnceWith({
        data: { action: "api::config.config.find", role: 1 },
      });
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("Content Manager > Config")
      );
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("booking and editing are closed")
      );
      if (!urls.base_url) {
        expect(warn).toHaveBeenCalledWith(
          expect.stringContaining(
            "BASE_URL and API_BASE_URL in the backend environment"
          )
        );
      } else {
        expect(warn).not.toHaveBeenCalledWith(
          expect.stringContaining("in the backend environment")
        );
      }
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("Content Manager > Time Slot")
      );
      expect(warn.mock.calls.flat().join(" ")).not.toContain(
        "browser-public-test-token"
      );
    }
  );

  it("bootstrap_UnrelatedGrantsAndRestart_Expect_OnlyPublicConfigGrantAdded", async () => {
    // Arrange
    const { strapi, configs, tokens, permissions, permissionRows } =
      createHarness();
    const existingGrants = [
      { id: 1, action: "api::time-slot.time-slot.find", role: 1 },
      { id: 2, action: "api::config.config.find", role: 2 },
    ];
    permissionRows.push(...existingGrants);

    // Act
    await lifecycle.bootstrap({ strapi });
    await lifecycle.bootstrap({ strapi });

    // Assert
    expect(tokens.create).toHaveBeenCalledOnce();
    expect(configs.create).toHaveBeenCalledOnce();
    expect(configs.update).not.toHaveBeenCalled();
    expect(permissions.create).toHaveBeenCalledExactlyOnceWith({
      data: { action: "api::config.config.find", role: 1 },
    });
    expect(permissionRows).toEqual([
      ...existingGrants,
      { id: 3, action: "api::config.config.find", role: 1 },
    ]);
  });

  it("bootstrap_ConfiguredDatabase_Expect_PreservedConfigAndNoWarnings", async () => {
    // Arrange
    const { strapi, configs, tokens, timeSlots, warn } = createHarness();
    const existing = {
      documentId: "existing-config",
      max_time_slots: 1,
      api_token: "existing-browser-token",
      base_url: "https://booking.example.org",
      api_base_url: "https://api.example.org",
      route_planning_deadline: "2099-12-01T00:00:00.000Z",
      final_deadline: "2099-12-05T00:00:00.000Z",
      verification_email_subject_template: "Custom subject",
      confirmation_email_subject_template: "Custom confirmation subject",
      confirmation_email_body_template: CUSTOM_CONFIRMATION_BODY,
    };
    configs.findFirst.mockResolvedValue(existing);
    timeSlots.count.mockResolvedValue(1);
    vi.stubEnv("BASE_URL", "https://do-not-overwrite.example.org");
    vi.stubEnv("API_BASE_URL", "https://do-not-overwrite-api.example.org");

    // Act
    await lifecycle.bootstrap({ strapi });

    // Assert
    expect(configs.create).not.toHaveBeenCalled();
    expect(configs.update).not.toHaveBeenCalled();
    expect(tokens.create).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect((await configs.findFirst()).max_time_slots).toBe(1);
  });

  it.each([
    { confirmation_email_subject_template: null },
    { confirmation_email_subject_template: "" },
    { confirmation_email_body_template: undefined },
    { confirmation_email_body_template: null },
    { confirmation_email_body_template: [] },
    {
      confirmation_email_subject_template: null,
      confirmation_email_body_template: null,
    },
  ])(
    "bootstrap_MissingConfirmationTemplates%j_Expect_OnlyMissingDefaultsFilled",
    async (missingTemplates) => {
      // Arrange
      const { strapi, configs, tokens } = createHarness();
      await lifecycle.bootstrap({ strapi });
      await configs.update({
        data: {
          max_time_slots: 1,
          confirmation_email_subject_template: "Custom confirmation subject",
          confirmation_email_body_template: CUSTOM_CONFIRMATION_BODY,
          ...missingTemplates,
        },
      });
      const savedConfig = await configs.findFirst();
      configs.update.mockClear();
      const expectedDefaults = Object.fromEntries(
        Object.keys(missingTemplates).map((field) => [
          field,
          defaultEmailTemplates[field],
        ])
      );

      // Act
      await lifecycle.bootstrap({ strapi });

      // Assert
      expect(configs.update).toHaveBeenCalledExactlyOnceWith({
        documentId: "config-document",
        data: expectedDefaults,
      });
      expect(await configs.findFirst()).toEqual({
        ...savedConfig,
        ...expectedDefaults,
      });
      expect(tokens.create).toHaveBeenCalledOnce();
    }
  );

  it.each([
    {},
    { base_url: "https://saved-booking.example.org" },
    { api_base_url: "https://saved-api.example.org" },
  ])(
    "bootstrap_EnvironmentUrls_Expect_NoPersistedUrlCopies",
    async (savedUrls) => {
      // Arrange
      const { strapi, configs } = createHarness();
      await lifecycle.bootstrap({ strapi });
      await configs.update({ data: savedUrls });
      const savedConfig = await configs.findFirst();
      configs.update.mockClear();
      vi.stubEnv("BASE_URL", ` ${ENV_URLS.base_url} `);
      vi.stubEnv("API_BASE_URL", ENV_URLS.api_base_url);

      // Act
      await lifecycle.bootstrap({ strapi });

      // Assert
      expect(configs.update).not.toHaveBeenCalled();
      expect(await configs.findFirst()).toEqual(savedConfig);
      expect(strapi.service("api::config.config").getPublicUrls()).toEqual(
        ENV_URLS
      );
    }
  );

  it.each([
    "not-a-url",
    "ftp://booking.example.org",
    "https://user:password@booking.example.org",
  ])(
    "bootstrap_InvalidBaseUrl%s_Expect_UnsetUrlAndRecoveryWarning",
    async (value) => {
      // Arrange
      const { strapi, configs, warn } = createHarness();
      vi.stubEnv("BASE_URL", value);

      // Act
      await lifecycle.bootstrap({ strapi });

      // Assert
      expect((await configs.findFirst()).base_url).toBeUndefined();
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining(
          "BASE_URL and API_BASE_URL in the backend environment"
        )
      );
      expect(warn.mock.calls.flat().join(" ")).not.toContain(value);
    }
  );

  it.each([
    [null, "2099-12-05T00:00:00.000Z"],
    ["2099-12-01T00:00:00.000Z", null],
  ])(
    "bootstrap_PartialDeadlines_Expect_ClosedBookingWarning",
    async (routeDeadline, finalDeadline) => {
      // Arrange
      const { strapi, configs, warn } = createHarness();
      configs.findFirst.mockResolvedValue({
        documentId: "existing-config",
        route_planning_deadline: routeDeadline,
        final_deadline: finalDeadline,
      });

      // Act
      await lifecycle.bootstrap({ strapi });

      // Assert
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining("booking and editing are closed")
      );
    }
  );

  it("bootstrap_TokenCreationFailure_Expect_NoConfigOrPublicGrant", async () => {
    // Arrange
    const { strapi, configs, permissions, tokens } = createHarness();
    tokens.create.mockRejectedValue(new Error("Token creation failed"));

    // Act
    const result = lifecycle.bootstrap({ strapi });

    // Assert
    await expect(result).rejects.toThrow("Token creation failed");
    expect(configs.create).not.toHaveBeenCalled();
    expect(permissions.create).not.toHaveBeenCalled();
  });

  it("bootstrap_ConflictingTokenName_Expect_RecoveryInstructionsWithoutRotation", async () => {
    // Arrange
    const { strapi, configs, tokens } = createHarness();
    tokens.getByName.mockResolvedValue({ id: 42 });

    // Act
    const result = lifecycle.bootstrap({ strapi });

    // Assert
    await expect(result).rejects.toThrow(
      "Restore Config with its original token"
    );
    expect(tokens.create).not.toHaveBeenCalled();
    expect(configs.create).not.toHaveBeenCalled();
  });
});
