/**
 * booking service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::booking.booking",
  ({ strapi }) => ({
    async sendVerificationEmail(bookingId: string) {
      try {
        if (!bookingId) {
          throw new Error("Booking ID is required");
        }

        // Fetch config data from your config content type
        const config = await strapi.documents("api::config.config").findFirst();

        const booking = await strapi.documents("api::booking.booking").findOne({
          documentId: bookingId,
          populate: {
            contact_person: true,
          },
        });

        if (!booking) {
          throw new Error("Booking not found");
        }

        // Send email using Strapi's email provider
        await strapi.plugins["email"].services.email.send({
          to: booking.contact_person.email,
          subject: "E-Mail verifiziert - Vervollständige deine Buchung",
          text: "Du hast deine E-Mail erfolgreich verifiziert. Du kannst jetzt deine Buchung vervollständigen, indem du alle erforderlichen Informationen eingibst...",
          html: `
          <h1>E-Mail erfolgreich verifiziert!</h1>
          <p>Vielen Dank für die Verifizierung deiner E-Mail-Adresse. Du kannst jetzt deine Buchung vervollständigen, indem du alle erforderlichen Informationen eingibst.</p>
          <p>Nutze den untenstehenden Link, um deine Buchung jederzeit aufzurufen und zu bearbeiten:</p>
          <a href="${config.base_url}/?id=${bookingId}">Buchung vervollständigen/bearbeiten</a>
          <p>Bitte stelle sicher, dass du alle erforderlichen Felder für eine erfolgreiche Buchung ausfüllst.</p>
          `,
        });

        return { success: true };
      } catch (error) {
        console.error("Email sending failed:", error);
        throw error;
      }
    },
  })
);
