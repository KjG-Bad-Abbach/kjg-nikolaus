export default {
  async afterCreate(event) {
    await strapi
      .service("api::booking.booking")
      .sendVerificationEmail(event.result.documentId);
  },
};
