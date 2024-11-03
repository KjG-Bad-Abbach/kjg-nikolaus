/**
 * time-slot controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::time-slot.time-slot",
  ({ strapi }) => ({
    async find(ctx) {
      // Call the default find method
      const { data, meta } = await super.find(ctx);

      // Query bookings to calculate available slots for each time slot
      const bookings = await strapi.documents("api::booking.booking").findMany({
        filters: {
          time_slots: {
            id: {
              $in: data.map((timeSlot) => timeSlot.id),
            },
          },
        },
        populate: {
          time_slots: true,
        },
      });

      // Add a calculated field to each time slot
      const enhancedData = data.map((timeSlot) => {
        const bookingsForTimeSlot = bookings.filter((booking) =>
          (booking as any).time_slots?.some((ts) => ts.id === timeSlot.id)
        );
        return {
          ...timeSlot,
          available_slots: timeSlot.max_bookings - bookingsForTimeSlot.length,
        };
      });

      // Return the enhanced data
      return { data: enhancedData, meta };
    },

    async findOne(ctx) {
      // Call the default findOne method
      let { data, meta } = await super.findOne(ctx);

      if (data.bookings) {
        // Add a calculated field to the time slot
        data = {
          ...data,
          available_slots: data.max_bookings - data.bookings.length,
        };
        delete data.bookings;
      }

      // Return the enhanced data
      return { data, meta };
    },
  })
);
