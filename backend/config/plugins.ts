export default ({ env }) => ({
  email: {
    config: {
      provider: "nodemailer",
      providerOptions: {
        host: env("SMTP_HOST"),
        port: env("SMTP_PORT"),
        auth:
          !env("SMTP_USERNAME") && !env("SMTP_PASSWORD")
            ? undefined
            : {
                user: env("SMTP_USERNAME"),
                pass: env("SMTP_PASSWORD"),
              },
        ignoreTLS: env("SMTP_IGNORE_TLS"),
        connectionTimeout: env("SMTP_CONNECTION_TIMEOUT", 5000),
        timeout: env("SMTP_TIMEOUT", 5000),
      },
      settings: {
        defaultFrom: env("SMTP_DEFAULT_FROM"),
        defaultReplyTo: env("SMTP_DEFAULT_REPLY_TO"),
      },
    },
  },
});
