import { describe, expect, it, vi } from "vitest";
import createBookingService from "@/api/booking/services/booking";

vi.mock("@strapi/strapi", () => ({
  factories: {
    createCoreService: (_uid: string, extension: unknown) => extension,
  },
}));

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
      const bookingId = "s6jtaxshtk43sievz5wxigbl";
      const expectedUrl = `${expectedBaseUrl}?id=${bookingId}`;
      const config = {
        base_url: baseUrl,
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
      const strapi = {
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

      // Act
      await service.sendVerificationEmail(bookingId);

      // Assert
      expect(send).toHaveBeenCalledOnce();
      expect(send).toHaveBeenCalledWith({
        to: booking.contact_person.email,
        subject: `Booking ${expectedUrl}`,
        html: expect.stringContaining(`href="${expectedUrl}"`),
        text: expect.stringContaining(`[Open](${expectedUrl})`),
      });
    },
  );
});
