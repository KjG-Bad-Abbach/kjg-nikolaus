# Repository Guidelines

## Project Structure & Module Organization
`backend/` hosts the Strapi 5 TypeScript service; keep business logic in `src/api`, shared helpers in `src/utils`, and reusable fields under `components/`. App config lives in `config/`, while database seed or migration assets belong in `database/`. The static frontend sits in `frontend/`, with Tailwind styles in `src/css/`, Alpine.js behaviour in `src/js/app.js`, and view templates in `src/index.html`. Root-level `docker-compose.yml` bootstraps the stack and `.env.example` lists required environment keys.

## Build, Test, and Development Commands
Install dependencies with `pnpm install` run separately in `backend/` and `frontend/`. Start the editable backend with `cd backend && pnpm develop`; use `pnpm build` before deploying. For the frontend, run `cd frontend && pnpm dev` during feature work or `pnpm build` to emit the production bundle. To exercise the full stack, run `docker compose up --build` from the repository root; Mailhog will then be available at `http://localhost:8025`.

## Coding Style & Naming Conventions
Backend code uses TypeScript with 2-space indentation, named exports, and camelCase function/variable names (see `backend/src/utils/ParameterReplacer.ts`). Create new Strapi components in PascalCase directories under `src/api`. Frontend code relies on Tailwind utility classes; keep custom CSS scoped under `.app` and prefer semantic HTML fragments. Format frontend assets with `pnpm exec prettier --write src`, and avoid mixing Yarn/NPM commands—stick with `pnpm`.

## Testing Guidelines
Automated tests are not yet in place. Document the manual flows you exercised (e.g., booking creation, verification email, slot reassignment) in your pull request. When you add non-trivial logic, scaffold integration coverage under a new `backend/tests/` folder and capture edge cases with fixture data in `database/`. Validate UI changes against the running backend at `http://localhost:3000` and confirm notification output through Mailhog.

## Commit & Pull Request Guidelines
Follow the existing conventional-commit style with optional emoji, such as `feat: :zap: support multi-slot reminders`. Keep summaries under 72 characters, describe rationale in the body, and reference issue IDs where available. Pull requests should include: a concise change summary, configuration modifications (call out `.env` keys), manual-verification notes, and screenshots/GIFs for any UI change. Request review from a maintainer covering the touched module.

## Configuration & Security Notes
Never commit real secrets; copy `.env.example` to `.env` locally and share credentials through the team vault. When backend schema changes require data resets, mention whether contributors must run `docker compose down -v` in the pull-request description. Rotate Strapi API tokens after demos.
