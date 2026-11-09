# Repository Guidelines

- **CRITICAL:** English identifiers, comments, docs, and replies; non-English text belongs in localization files.
  - Temporary exception until all German UI text is migrated application-wide: inline German UI strings are allowed; avoid partial localization extractions.
- **CRITICAL:** Before code, test, or structure changes, read applicable standards and apply them during implementation.
- **CRITICAL:** Before coding, read existing `DEVELOPMENT.md` files along each edited file's directory hierarchy, from project root to containing folder.
  - Each applies only to its folder and descendants; e.g., `tests/DEVELOPMENT.md` applies only when editing under `tests/`.
- [Read when modifying code/tests files](docs/CODING_STANDARDS.md)
  - [Read when modifying C# code](docs/CODING_STANDARDS_CSHARP.md)
- [Read for code/test changes and test-work decisions](docs/TESTING_STANDARDS.md)

## Response style

- Extremely brief bullets; no full sentences, fluff, or generic openings.
- Precise and results-oriented; actionable.
- Source links for factual claims when web search is enabled.
- Never return full file contents to a caller. Prefer pointing to the exact file locations with line references or a focused search command (such as `grep` or `rg`). Summarize only when those options do not answer the request; quote only the necessary details. This is especially important for exploration tasks and saves tokens.

## Implementation and review

- During review, check changes against these guidelines and applicable standards; report violations without editing source.
- **CRITICAL:** DRY is non-negotiable for code quality and maintainability: never repeat the same rule or logic; study existing code before edits and reuse or extract it through composable helpers, not modifying existing behavior. Code that merely looks similar is not duplication.
- SOLID, YAGNI, KISS; extend through composition/helpers and separate concerns is important.
- Domain terminology matching the specification.
- Do a good job, finding exactly the right places to make the changes
- Minimal, focused edits; follow existing structure, naming, style, and patterns.
- Important: Follow the [behavior- and risk-focused testing strategy](docs/TESTING_STANDARDS.md#testing-work-follows-behavior-and-risk).
- One concern per commit; split when needed.

## Documentation

- One source of truth; consolidate repeated commands/patterns and reference them elsewhere.
- Keep README guides user-focused: simple steps for using the tool, not technical explanations of its implementation.
- Put implementation details in the repository's technical documentation; if no dedicated location exists, use the corresponding task file.
- Prefer actionable failure and recovery instructions in the tool's error output; add README troubleshooting hints only when the tool does not provide enough guidance itself.

## Security

- Secrets in `.env`; never commit real credentials; use `*.example` baselines.

## Project Structure & Module Organization
`backend/` hosts the Strapi 5 TypeScript service; keep business logic in `src/api`, shared helpers in `src/utils`, and reusable fields under `components/`. App config lives in `config/`, while database seed or migration assets belong in `database/`. The static frontend sits in `frontend/`, with Tailwind styles in `src/css/`, Alpine.js behaviour in `src/js/app.js`, and view templates in `src/index.html`. Root-level `docker-compose.yml` bootstraps the stack and `.env.example` lists required environment keys.

## Build, Test, and Development Commands
Install dependencies with `pnpm install` run separately in `backend/` and `frontend/`. Start the editable backend with `cd backend && pnpm develop`; use `pnpm build` before deploying. For the frontend, run `cd frontend && pnpm dev` during feature work or `pnpm build` to emit the production bundle. To exercise the full stack, run `docker compose up --build` from the repository root; Mailhog will then be available at `http://localhost:8025`.

## Coding Style & Naming Conventions
Backend code uses TypeScript with 2-space indentation, named exports, and camelCase function/variable names (see `backend/src/utils/ParameterReplacer.ts`). Create new Strapi components in PascalCase directories under `src/api`. Frontend code relies on Tailwind utility classes; keep custom CSS scoped under `.app` and prefer semantic HTML fragments. Format frontend assets with `pnpm exec prettier --write src`, and avoid mixing Yarn/NPM commands—stick with `pnpm`.

Preserve all existing inline or block comments when editing code. Add comments to newly written sections only when they convey intent or describe structure beyond what the surrounding code already suggests; skip comments that simply restate the code.

## Testing Guidelines
Automated tests are not yet in place. Document the manual flows you exercised (e.g., booking creation, verification email, slot reassignment) in your pull request. When you add non-trivial logic, scaffold integration coverage under a new `backend/tests/` folder and capture edge cases with fixture data in `database/`. Validate UI changes against the running backend at `http://localhost:3000` and confirm notification output through Mailhog.
