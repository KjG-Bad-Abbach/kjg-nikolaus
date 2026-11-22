import type { Core, Schema } from "@strapi/strapi";
import configSchema from "./api/config/content-types/config/schema.json";
import localizedEmailDefaults from "./locales/de.json";

const emailDefaults = localizedEmailDefaults as {
  confirmation_email_subject_template: string;
  confirmation_email_body_template: Schema.Attribute.BlocksValue;
  verification_email_subject_template: string;
  verification_email_body_template: Schema.Attribute.BlocksValue;
};

const TOKEN_NAME = "Booking frontend";
const CONFIG_FIND_ACTION = "api::config.config.find";
const TOKEN_PERMISSIONS = [
  CONFIG_FIND_ACTION,
  "api::booking.booking.sendVerificationEmail",
  "api::booking.booking.create",
  "api::booking.booking.update",
  "api::booking.booking.findOne",
  "api::time-slot.time-slot.find",
  "api::time-slot.time-slot.findOne",
];

async function grantPublicConfigAccess(strapi: Core.Strapi): Promise<void> {
  const role = await strapi.db.query("plugin::users-permissions.role").findOne({
    where: { type: "public" },
  });
  if (!role) {
    throw new Error(
      "Initial setup: Public role is missing. Restore the Public role from a database backup, then restart."
    );
  }

  const permissions = strapi.db.query("plugin::users-permissions.permission");
  const permission = await permissions.findOne({
    where: { action: CONFIG_FIND_ACTION, role: role.id },
  });
  if (!permission) {
    await permissions.create({
      data: { action: CONFIG_FIND_ACTION, role: role.id },
    });
  }
}

export async function provision(strapi: Core.Strapi): Promise<void> {
  const configs = strapi.documents("api::config.config");
  const config = await strapi.db.transaction(async () => {
    let current = await configs.findFirst();

    if (!current) {
      const tokens = strapi.service("admin::api-token-content-api");
      if (await tokens.getByName(TOKEN_NAME)) {
        throw new Error(
          `Initial setup: API token '${TOKEN_NAME}' already exists but Config is missing. Restore Config with its original token from a database backup, or rename the unused token in the database, then restart.`
        );
      }
      const token = await tokens.create({
        name: TOKEN_NAME,
        description: "Browser-public token for the booking frontend",
        type: "custom",
        lifespan: null,
        permissions: TOKEN_PERMISSIONS,
      });
      current = await configs.create({
        data: {
          ...emailDefaults,
          api_token: token.accessKey,
          max_time_slots: configSchema.attributes.max_time_slots.default,
          show_search_for_time_slots:
            configSchema.attributes.show_search_for_time_slots.default,
        },
      });
    } else {
      const missingDefaults = {
        ...(!current.confirmation_email_subject_template && {
          confirmation_email_subject_template:
            emailDefaults.confirmation_email_subject_template,
        }),
        ...(!current.confirmation_email_body_template?.length && {
          confirmation_email_body_template:
            emailDefaults.confirmation_email_body_template,
        }),
      };
      if (Object.keys(missingDefaults).length) {
        current = await configs.update({
          documentId: current.documentId,
          data: missingDefaults,
        });
      }
    }

    await grantPublicConfigAccess(strapi);
    return current;
  });

  if (!config.route_planning_deadline || !config.final_deadline) {
    strapi.log.warn(
      "Initial setup: booking and editing are closed. Next: set route_planning_deadline and final_deadline in Content Manager > Config."
    );
  }
  const publicUrls = strapi.service("api::config.config").getPublicUrls();
  const missingUrls = [
    ["BASE_URL", publicUrls.base_url],
    ["API_BASE_URL", publicUrls.api_base_url],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
  if (missingUrls.length) {
    strapi.log.warn(
      `Initial setup: set ${missingUrls.join(" and ")} in the backend environment and restart. Use browser-reachable absolute HTTP(S) URLs without credentials; BASE_URL is used in booking emails. URLs are not editable in Config.`
    );
  }
  if (!(await strapi.documents("api::time-slot.time-slot").count({}))) {
    strapi.log.warn(
      "Initial setup: no time slots exist. Next: create this season's time slots in Content Manager > Time Slot. Configure SMTP and verify a booking email before opening bookings; see README.md."
    );
  }
}
