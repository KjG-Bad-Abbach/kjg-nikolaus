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

      if (timeSlots) {
        const bookableTimeSlotIds = (await strapi
          .service("api::booking.booking")
          .filterOnlyPossibleTimeSlotsForBooking(
            filteredTimeSlotIds,
            bookingId
          )) as string[];
        if (
          !filteredTimeSlotIds.every((s) => bookableTimeSlotIds.includes(s))
        ) {
          neededToCleanUpFullyBookedTimeSlots = true;
          filteredTimeSlotIds = bookableTimeSlotIds;
        }
      }

      return {
        filteredTimeSlotIds,
        neededToCleanUpFullyBookedTimeSlots,
        message,
      };
    },
  })
);
