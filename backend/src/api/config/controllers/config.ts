/**
 * config controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::config.config",
  ({ strapi }) => ({
    async find(ctx) {
      const response = await super.find(ctx);
      if (response.data) {
        // Deployment URLs are public response fields, not persisted Config attributes.
        Object.assign(
          response.data,
          strapi.service("api::config.config").getPublicUrls()
        );
      }
      return response;
    },
  })
);
