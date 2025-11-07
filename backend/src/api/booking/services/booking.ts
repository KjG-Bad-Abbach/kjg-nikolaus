/**
 * booking service
 */

import { factories } from "@strapi/strapi";
import { RichTextBlocksToHtmlRenderer } from "../../../utils/RichTextBlocksToHtmlRenderer";
import { RichTextBlocksToMarkdownRenderer } from "../../../utils/RichTextBlocksToMarkdownRenderer";
import { ParameterReplacer } from "../../../utils/ParameterReplacer";

function trim(value) {
  // also clean soft hyphen: \u00AD
  return (value || "").replace(/^[\s\u00AD]+|\u00AD+|[\s\u00AD]+$/g, "");
}

export default factories.createCoreService(
  "api::booking.booking",
  ({ strapi }) => ({
    clean(booking: any) {
      if (booking.contact_person?.first_name) {
        booking.contact_person.first_name = trim(
          booking.contact_person.first_name
        );
      }
      if (booking.contact_person?.last_name) {
        booking.contact_person.last_name = trim(
          booking.contact_person.last_name
        );
      }
      if (booking.contact_person?.email) {
        booking.contact_person.email = trim(booking.contact_person.email);
      }
      if (booking.contact_person?.phone_number) {
        booking.contact_person.phone_number = trim(
          booking.contact_person.phone_number
        );
      }
      if (booking.location?.street) {
        booking.location.street = trim(booking.location.street);
      }
      if (booking.location?.house_number) {
        booking.location.house_number = trim(booking.location.house_number);
      }
      if (booking.location?.zip_code) {
        booking.location.zip_code = trim(booking.location.zip_code);
      }
      if (booking.location?.place) {
        booking.location.place = trim(booking.location.place);
      }
      if (booking.present_location) {
        booking.present_location = trim(booking.present_location);
      }
      if (booking.children) {
        for (const child of booking.children) {
          if (child?.name) {
            child.name = trim(child.name);
          }
          if (child?.identification_trait) {
            child.identification_trait = trim(child.identification_trait);
          }
          if (child?.speech) {
            child.speech = trim(child.speech);
          }
        }
      }
      if (booking.additional_notes) {
        booking.additional_notes = trim(booking.additional_notes);
      }
    },

    async addHistoryEntry(bookingId: string, change?: any) {
      try {
        if (!bookingId) {
          throw new Error("Booking ID is required");
        }

        let booking = await strapi.documents("api::booking.booking").findOne({
          documentId: bookingId,
          populate: "*",
        });

        if (!booking) {
          throw new Error("Booking not found");
        }

        // create new history entry
        const historyEntry = {
          timestamp: new Date(),
          booking: bookingId,
          state: JSON.stringify(booking),
          change: JSON.stringify(change || null),
        };
        await strapi.documents("api::booking-history.booking-history").create({
          data: historyEntry,
        });
      } catch (error) {
        console.error("History entry failed:", error);
        throw error;
      }
    },

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

        let subject =
          config.verification_email_subject_template ||
          "E-Mail verifiziert - Vervollständige deine Buchung";
        const bookingUrl = `${config.base_url}/?id=${bookingId}`;

        let parameters = {
          booking_url: bookingUrl,
          // contact person
          first_name: booking.contact_person.first_name,
          last_name: booking.contact_person.last_name,
          phone_number: booking.contact_person.phone_number,
          email: booking.contact_person.email,
        } as { [key: string]: string | Function };

        // replace subject string
        subject = ParameterReplacer(subject, parameters as any);
        parameters.subject = subject;

        // render html
        function htmlButtonReplacer(match: string, param: string): string {
          return `
            <div class="mt-6">
              <a
                class="w-full rounded-sm bg-atlantis px-4 py-2 font-bold text-white hover:bg-surfie-green focus:outline-hidden focus:ring-2 focus:ring-java focus:ring-opacity-50"
                href="${bookingUrl}"
              >
                ${param || "Buchung vervollständigen/bearbeiten"}
              </a>
            </div>
            `;
        }
        parameters.button = htmlButtonReplacer;
        const htmlBlocks = ParameterReplacer(
          config.verification_email_body_template,
          parameters as any
        );
        const htmlRenderer = new RichTextBlocksToHtmlRenderer(htmlBlocks, {
          extend: {
            heading1: "text-calypso",
            heading2: "text-calypso",
            heading3: "text-calypso",
            heading4: "text-calypso",
            heading5: "text-calypso",
            heading6: "text-calypso",
            list: "marker:text-calypso",
            link: "text-atlantis hover:text-surfie-green",
          },
        });
        const innerHtml = htmlRenderer.render();
        // currently this css is a copy of /frontend/dist/css/app.css
        const fs = require("fs");
        const path = require("path");
        const mailCssPathLocal = path.join(__dirname, "mail.css");
        const mailCssPathFallback =
          "/opt/app/src/api/booking/services/mail.css";
        const mailCssPath = fs.existsSync(mailCssPathLocal)
          ? mailCssPathLocal
          : mailCssPathFallback;
        const css = fs.readFileSync(mailCssPath, "utf8");
        const html = `
          <!doctype html>
          <html lang="de">
            <head>
              <meta charset="UTF-8" />

              <!-- disable dark mode: https://stackoverflow.com/a/70579292 -->
              <meta name="color-scheme" content="light" />
              <meta name="supported-color-schemes" content="light" />

              <title>${subject}</title>

              <style>
                ${css}
              </style>
            </head>
            <body
              class="bg-java my-4 flex min-h-screen flex-col items-center justify-center"
            >
              <div class="mx-auto w-full max-w-3xl text-center">
                <h1 class="text-calypso mx-2 mb-4 text-4xl font-bold">
                  KjG Nikolaus Buchung
                </h1>

                <div
                  class="mx-2 my-8 space-y-6 rounded-lg bg-white p-6 text-left shadow-md"
                >
                  ${innerHtml}
                </div>
              </div>
            </body>
          </html>
          `;

        // render markdown
        function markdownButtonReplacer(match: string, param: string): string {
          return `\r\n\r\n[${param || "Buchung vervollständigen/bearbeiten"}](${bookingUrl})\r\n\r\n`;
        }
        parameters.button = markdownButtonReplacer;
        const markdownBlocks = ParameterReplacer(
          config.verification_email_body_template,
          parameters as any
        );
        const markdownRenderer = new RichTextBlocksToMarkdownRenderer(
          markdownBlocks,
          { escape: "lacy" }
        );
        const markdown = markdownRenderer.render();

        // Send email using Strapi's email provider
        await strapi.plugins["email"].services.email.send({
          to: booking.contact_person.email,
          subject: subject,
          text:
            markdown ||
            "Du hast deine E-Mail erfolgreich verifiziert. Du kannst jetzt deine Buchung vervollständigen, indem du alle erforderlichen Informationen eingibst...",
          html:
            html ||
            `
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

    async filterOnlyPossibleTimeSlotsForBooking(
      timeSlotIds: string[],
      bookingId?: string
    ): Promise<string[]> {
      // Filter time slots to only include those that are not fully booked
      // This is done by checking if the number of bookings for each time slot
      // is less than the maximum bookings allowed for that time slot.

      // Fetch config data from your config content type
      const config = await strapi.documents("api::config.config").findFirst();

      // Fetch time slots with their bookings to filter out fully booked slots
      const timeSlots = await strapi
        .documents("api::time-slot.time-slot")
        .findMany({
          filters: {
            documentId: {
              $in: timeSlotIds,
            },
          },
          populate: {
            bookings: true,
          },
        });

      // Filter out time slots that are not fully booked, excluding the current booking
      const possibleTimeSlots = timeSlots.filter(
        (slot) =>
          slot.bookings.filter((b) => b.documentId !== bookingId).length <
          slot.max_bookings * config.max_time_slots
      );

      // Return the IDs of the possible time slots
      return possibleTimeSlots.map((s) => s.documentId);
    },

    async sanitizeTimeSlots(
      timeSlots: any[],
      bookingId?: string
    ): Promise<{
      filteredTimeSlotIds: string[];
      neededToCleanUpFullyBookedTimeSlots: boolean;
      message: string;
    }> {
      let neededToCleanUpFullyBookedTimeSlots = false;
      let filteredTimeSlotIds = timeSlots.map((s) =>
        typeof s === "object" ? s.documentId : s
      );
      // const message =
      //   "One or more time slots are fully booked and have been removed from your selection." +
      //   " " +
      //   "The selected available time slots have been saved for you.";
      const message =
        "Ein oder mehrere Zeitslots sind vollständig ausgebucht und wurden aus deiner Auswahl entfernt." +
        " " +
        "Die ausgewählten verfügbaren Zeitslots wurden für dich gespeichert.";

      const bookableTimeSlotIds = (await strapi
        .service("api::booking.booking")
        .filterOnlyPossibleTimeSlotsForBooking(
          filteredTimeSlotIds,
          bookingId
        )) as string[];
      if (!filteredTimeSlotIds.every((s) => bookableTimeSlotIds.includes(s))) {
        neededToCleanUpFullyBookedTimeSlots = true;
        filteredTimeSlotIds = bookableTimeSlotIds;
      }

      return {
        filteredTimeSlotIds,
        neededToCleanUpFullyBookedTimeSlots,
        message,
      };
    },
  })
);
