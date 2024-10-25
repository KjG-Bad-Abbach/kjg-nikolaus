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

      // Add a calculated field to each time slot
      const enhancedData = data.map((timeSlot) => {
        if (timeSlot.bookings) {
          const enhancedTimeSlot = {
            ...timeSlot,
            available_slots: timeSlot.max_bookings - timeSlot.bookings.length,
          };
          delete enhancedTimeSlot.bookings;
          return enhancedTimeSlot;
        }
        return timeSlot;
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
