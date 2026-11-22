import type { Core } from "@strapi/strapi";
import { afterEach, describe, expect, it, vi } from "vitest";
import createBookingService from "@/api/booking/services/booking";
import createConfigService from "@/api/config/services/config";

vi.mock("@strapi/strapi", () => ({
  factories: {
    createCoreService: (_uid: string, extension: unknown) => extension,
  },
}));

const BOOKING_ID = "s6jtaxshtk43sievz5wxigbl";

function createHarness() {
  const config = {
    base_url: "https://ignored-database.example.org",
    verification_email_subject_template: "Booking {{booking_url}}",
    verification_email_body_template: [
      {
        type: "paragraph",
        children: [
          { type: "text", text: "{{booking_url}} {{button('Open')}}" },
        ],
      },
    ],
  };
  const booking = {
    contact_person: {
      first_name: "Alex",
      last_name: "Example",
      email: "alex@example.org",
      phone_number: "0123456789",
    },
  };
  const send = vi.fn().mockResolvedValue(undefined);
  const configService = createConfigService({ strapi: {} as Core.Strapi });
  const strapi = {
    service: vi.fn(() => configService),
    documents: (uid: string) =>
      uid === "api::config.config"
        ? { findFirst: async () => config }
        : { findOne: async () => booking },
    plugins: { email: { services: { email: { send } } } },
  };
  const service = (
    createBookingService as unknown as (context: { strapi: unknown }) => {
      sendVerificationEmail: (id: string) => Promise<unknown>;
    }
  )({ strapi });
  return { service, send, booking };
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("sendVerificationEmail", () => {
  it.each([
    ["http://10.1.50.222:3000", "http://10.1.50.222:3000/"],
    ["http://10.1.50.222:3000/", "http://10.1.50.222:3000/"],
    ["http://10.1.50.222:3000///", "http://10.1.50.222:3000/"],
    ["https://example.org/booking", "https://example.org/booking/"],
    ["https://example.org/booking/", "https://example.org/booking/"],
  ])(
    "sendVerificationEmail_BaseUrl%s_Expect_NormalizedLinks",
    async (baseUrl, expectedBaseUrl) => {
      // Arrange
      const expectedUrl = `${expectedBaseUrl}?id=${BOOKING_ID}`;
      vi.stubEnv("BASE_URL", baseUrl);
      const { service, send, booking } = createHarness();

      // Act
      await service.sendVerificationEmail(BOOKING_ID);

      // Assert
      expect(send).toHaveBeenCalledOnce();
      expect(send).toHaveBeenCalledWith({
        to: booking.contact_person.email,
        subject: `Booking ${expectedUrl}`,
        html: expect.stringContaining(`href="${expectedUrl}"`),
        text: expect.stringContaining(`[Open](${expectedUrl})`),
      });
    }
  );

  it.each(["", "not-a-url"])(
    "sendVerificationEmail_UnusableBaseUrl%s_Expect_RejectionWithoutDatabaseFallback",
    async (baseUrl) => {
      // Arrange
      const { service, send } = createHarness();
      vi.stubEnv("BASE_URL", baseUrl);
      vi.spyOn(console, "error").mockImplementation(() => {});

      // Act
      const result = service.sendVerificationEmail(BOOKING_ID);

      // Assert
      await expect(result).rejects.toThrow(
        "Set BASE_URL to a valid public HTTP(S) URL in the backend environment, then restart"
      );
      expect(send).not.toHaveBeenCalled();
    }
  );
});
