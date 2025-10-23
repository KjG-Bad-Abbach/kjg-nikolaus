# Strapi Backend Contribution Notes

## Local Setup
- Install dependencies with `pnpm install`.
- Start the admin server during development using `pnpm develop`; run `pnpm build` before deploying to production.
- Use `docker compose up backend db` when you need a predictable Postgres instance and seed data.

## CLI Essentials
- `pnpm strapi generate` opens the interactive generator for APIs, controllers, content-types, policies, middlewares, services, and migrations. The CLI "detects TypeScript or JavaScript automatically and creates files with the correct extension."
- The generator menu includes destination choices such as New API, Existing API, or Existing plugin, and lets you pick collection or single content-types.
- Run `pnpm strapi routes:list`, `pnpm strapi policies:list`, or `pnpm strapi middlewares:list` to display available routes, registered policies, or middlewares.
- Regenerate TypeScript definitions after schema updates with `pnpm strapi ts:generate-types --silent`; the command writes updated typings to the `types` directory.

## Content-Type & Component Workflow
- "Content-types can be created with the Content-type Builder in the admin panel, or with Strapi's interactive CLI `strapi generate` command." The generated schema lives under `src/api/<api-name>/content-types/<type-name>/schema.json`.
- "Component models can't be created with CLI tools. Use the Content-type Builder or create them manually." Components belong in `src/components/<category>/<component>.json`.
- When you add or change a content-type, restart Strapi and re-run `pnpm strapi ts:generate-types` so downstream code picks up the update.

## Admin Tips
- "The Content-type Builder is only accessible to create and update content-types when your Strapi application is in a development environment." Commit the updated schema files to Git.
- Document any migration prerequisites in `database/README.md` and coordinate data changes with the team before merging.

## Security & Access
- Reset an admin password with `pnpm strapi admin:reset-user-password --email=<user> --password=<newPass>` when onboarding or recovering access.
- Store API tokens in the team vault; never commit them. Rotate tokens after demos or when revoking contractor access.
