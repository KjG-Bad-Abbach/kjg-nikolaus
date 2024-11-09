/**
 * booking controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::booking.booking",
  ({ strapi }) => ({
    async sendVerificationEmail(ctx) {
      if (!ctx.params.id) {
        return ctx.badRequest("Booking ID is required");
      }

      return await strapi
        .service("api::booking.booking")
        .sendVerificationEmail(ctx.params.id);
    },

    async create(ctx) {
      const data = (await this.sanitizeInput(ctx.request.body.data, ctx)) as {
        time_slots?: any[];
      };

      // Sanitize time slots to keep only available ones for booking
      const filterResult = await strapi
        .service("api::booking.booking")
        .sanitizeTimeSlots(data.time_slots);
      if (filterResult.neededToCleanUpFullyBookedTimeSlots) {
        data.time_slots = filterResult.filteredTimeSlotIds;
      }

      ctx.request.body.data = data;
      const response = await super.create(ctx);

      if (filterResult.neededToCleanUpFullyBookedTimeSlots) {
        response.meta.concurrencyTimeSlotsError = true;
        return ctx.conflict(filterResult.message, response);
      }
      return response;
    },

    async update(ctx) {
      const data = (await this.sanitizeInput(ctx.request.body.data, ctx)) as {
        time_slots?: any[];
      };

      // Sanitize time slots to keep only available ones for booking
      const filterResult = await strapi
        .service("api::booking.booking")
        .sanitizeTimeSlots(data.time_slots, ctx.params.id);
      if (filterResult.neededToCleanUpFullyBookedTimeSlots) {
        data.time_slots = filterResult.filteredTimeSlotIds;
      }

      ctx.request.body.data = data;
      const response = await super.update(ctx);

      if (filterResult.neededToCleanUpFullyBookedTimeSlots) {
        response.meta.concurrencyTimeSlotsError = true;
        return ctx.conflict(filterResult.message, response);
      }
      return response;
    },
  })
);
