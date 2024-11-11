/**
 * time-slot controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::time-slot.time-slot",
  ({ strapi }) => ({
    async create(ctx) {
      if (Array.isArray(ctx.request.body?.data)) {
        const responseDatas = [];
        const responseMetas = [];
        for (const data of ctx.request.body.data) {
          ctx.request.body.data = data;
          const response = await super.create(ctx);
          responseDatas.push(response.data);
          responseMetas.push(response.meta);
        }
        return {
          data: responseDatas,
          meta: responseMetas,
        };
      } else {
        return await super.create(ctx);
      }
    },

    async find(ctx) {
      // Call the default find method
      const { data, meta } = await super.find(ctx);

      const enhancedData = await strapi
        .service("api::time-slot.time-slot")
        .enhanceTimeSlots(data);

      return { data: enhancedData, meta };
    },

    async findOne(ctx) {
      // Call the default findOne method
      const { data, meta } = await super.findOne(ctx);

      const enhancedData = (
        await strapi
          .service("api::time-slot.time-slot")
          .enhanceTimeSlots([data])
      )[0];

      // Return the enhanced data
      return { data: enhancedData, meta };
    },
  })
);
