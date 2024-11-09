/**
 * time-slot service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::time-slot.time-slot",
  ({ strapi }) => ({
    async enhanceTimeSlots(timeSlots: any[]) {
      const timeSlotIds = timeSlots.map((ts) => ts.documentId);

      // Fetch config data from your config content type
      const config = await strapi.documents("api::config.config").findFirst();

      // Query bookings to calculate available slots for each time slot
      const bookings = await strapi.documents("api::booking.booking").findMany({
        filters: {
          time_slots: {
            documentId: {
              $in: timeSlotIds,
            },
          },
        },
        populate: {
          time_slots: true,
        },
      });

      // Add a calculated field to each time slot
      const enhancedTimeSlots = timeSlots.map((timeSlot) => {
        const bookingsForTimeSlot = bookings.filter((booking) =>
          (booking as any).time_slots?.some((ts) => ts.documentId === timeSlot.documentId)
        );
        const maxReservations = timeSlot.max_bookings * config.max_time_slots;
        return {
          ...timeSlot,
          max_reservations: maxReservations,
          available_reservations: maxReservations - bookingsForTimeSlot.length,
        };
      });

      // Return the enhanced data
      return enhancedTimeSlots;
    },
  })
);
