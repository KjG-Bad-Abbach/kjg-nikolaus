/**
 * booking router
 */

export default {
  routes: [
    {
      method: "POST",
      path: "/bookings/:id/send-verification-email",
      handler: "booking.sendVerificationEmail",
    },
  ],
};
