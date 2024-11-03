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

      return strapi
        .service("api::booking.booking")
        .sendVerificationEmail(ctx.params.id);
    },
  })
);
