# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KjG Nikolaus Buchung is a full-stack booking system for coordinating Saint Nicholas (Nikolaus) home visits. The system allows families to book time slots, manages concurrent reservations with overbooking logic (configured via `max_time_slots`), and handles email verification workflows. The backend is built with Strapi 5 CMS (TypeScript) and the frontend uses Alpine.js with Tailwind CSS.

## Development Commands

### Backend (Strapi 5)
```bash
cd backend
pnpm install                  # Install dependencies
pnpm develop                  # Start development server (http://localhost:1337/admin)
pnpm build                    # Production build
pnpm start                    # Start production server
pnpm test                     # Run tests with coverage
pnpm test:watch              # Run tests in watch mode
```

### Frontend (Alpine.js + Tailwind)
```bash
cd frontend
pnpm install                  # Install dependencies
pnpm dev                      # Watch mode with hot reload
pnpm build                    # Production build
pnpm format                   # Format code with Prettier
pnpm lint                     # Check formatting
pnpm test:unit               # Run unit tests with coverage
pnpm test:e2e                # Run Playwright tests (all browsers)
pnpm test:e2e:fast           # Run Playwright tests (chromium only)
pnpm test:e2e:headed         # Run Playwright tests with UI
```

### Docker Stack
```bash
# From repository root
docker compose up --build     # Start full stack (backend, frontend, PostgreSQL, pgAdmin, Mailhog)
docker compose down -v        # Tear down and remove volumes (resets database)
```

Services:
- Backend (Strapi): http://localhost:1337
- Frontend: http://localhost:3000
- Mailhog (email testing): http://localhost:8025
- pgAdmin: http://localhost:5050

## Architecture

### Backend Structure (`backend/`)

**API Modules** (`src/api/`):
- `booking/`: Core booking entity with custom controllers for `create`, `update`, and `sendVerificationEmail`. Implements time slot sanitization and concurrency handling.
- `booking-history/`: Audit log that snapshots booking state changes via lifecycle hooks.
- `config/`: Single-type for application configuration (deadlines, email templates, max_time_slots, etc.).
- `time-slot/`: Manages available time windows with `start`, `end`, and `max_bookings` fields.

**Utilities** (`src/utils/`):
- `ParameterReplacer.ts`: Template engine for email placeholders like `{{first_name}}`, `{{booking_url}}`, `{{button('text')}}`.
- `RichTextBlocksToHtmlRenderer.ts`: Converts Strapi rich text blocks to HTML for emails.
- `RichTextBlocksToMarkdownRenderer.ts`: Converts Strapi rich text blocks to Markdown for plain-text email fallback.

**Components** (`src/components/`):
- `booking/`: Reusable booking-related components (children, contact person, location, etc.).
- `shared/`: Shared components across content types.

**Key Architectural Patterns**:
- **Lifecycle Hooks**: `booking/content-types/booking/lifecycles.ts` automatically creates history entries after booking updates.
- **Service Layer**: Business logic lives in `services/booking.ts` (e.g., `clean()`, `sanitizeTimeSlots()`, `sendVerificationEmail()`).
- **Custom Controllers**: Override default Strapi CRUD to add validation, time slot filtering, and conflict responses.
- **History Tracking**: Every booking mutation triggers a snapshot via `addHistoryEntry()`, storing full state + delta in `booking-history`.

### Frontend Structure (`frontend/`)

**Build System**: Laravel Mix with Tailwind CSS 4 and Alpine.js bundling.

**Source Files** (`src/`):
- `index.html`: Single-page app with multi-step booking form (contact -> location -> time slots -> children -> review).
- `js/app.js`: Alpine.js entry point; orchestrates state management and API calls.
- `css/`: Tailwind base styles and custom utilities.

**Key Patterns**:
- **Alpine.js Reactivity**: Component state managed via `x-data`, API interactions via `fetch()` to Strapi endpoints.
- **Multi-Step Form**: Steps 0-5 progress through booking workflow; validation state tracked per step.
- **Email Verification Flow**: User submits contact info -> receives verification email with unique booking URL -> completes booking.

## Time Slot Overbooking Logic

The system supports intentional overbooking to optimize route planning:
- Each time slot has `max_bookings` (number of concurrent Nikolaus teams).
- `Config.max_time_slots` (e.g., 3) allows each family to reserve multiple slots.
- **Example**: If `max_bookings = 4` and `max_time_slots = 3`, a slot accepts `4 × 3 = 12` reservations. After reservation deadline, organizers assign one slot per family.
- **Concurrency Handling**: `sanitizeTimeSlots()` filters out fully booked slots during create/update and returns conflict errors if slots were removed.

## Email System

**Provider**: Nodemailer (configured in `backend/config/plugins.ts`).

**Development**: Emails route to Mailhog (http://localhost:8025).

**Templates**: Defined in `Config` single-type:
- `verification_email_subject_template`
- `verification_email_body_template`

**Rendering Pipeline**:
1. Strapi rich text blocks -> HTML via `RichTextBlocksToHtmlRenderer`
2. Strapi rich text blocks -> Markdown via `RichTextBlocksToMarkdownRenderer`
3. Template placeholders replaced via `ParameterReplacer`
4. Both HTML and plain-text versions sent

## Testing

**Backend**: Vitest configured but no tests yet. Add integration tests under `backend/tests/` covering:
- Time slot concurrency edge cases
- Email template rendering
- Booking validation logic

**Frontend E2E**: Playwright tests in `frontend/tests/e2e/`:
- `homepage-smoke`: Captures full-page screenshot after hero renders (baseline stored in `__screenshots__/`).
- Update baselines: `pnpm test:e2e:fast homepage-smoke --update-snapshots`
- View report: `pnpm exec playwright show-report`

**Manual Testing Checklist** (document in PRs):
- Booking creation flow (all steps)
- Email verification delivery
- Time slot conflict handling
- Multi-slot reservation logic

## Environment Configuration

Copy `.env.example` to `.env` and configure:

**Critical Variables**:
- `APP_KEYS`, `JWT_SECRET`, `ADMIN_JWT_SECRET`: Strapi security tokens
- `DATABASE_*`: PostgreSQL connection details
- `API_TOKEN`: Frontend -> backend authentication token (create in Strapi Settings -> API Tokens)
- `API_BASE_URL`: Frontend API endpoint (e.g., `http://localhost:1337`)

**API Token Permissions** (for `API_TOKEN`):
- `Config`: find
- `Booking`: sendVerificationEmail, create, update, findOne
- `Time-slot`: find, findOne

## Strapi Configuration Workflow

1. Start backend: `cd backend && pnpm develop`
2. Access admin: http://localhost:1337/admin
3. Configure `Content Manager` -> `Single Types` -> `Config`:
   - Set `api_token`, `base_url`, `api_base_url`
   - Configure `max_time_slots` (default: 3)
   - Set deadlines: `route_planning_deadline`, `final_deadline`
   - Write email templates (see README.md for examples)
4. Create time slots in `Content Manager` -> `Collection Types` -> `Time Slot` or via REST API (see README.md for HTTP examples)
5. Set permissions: `Settings` -> `Users & Permissions Plugin` -> `Roles` -> `Public`:
   - Enable `Config`: find

## Code Style

**Backend**:
- TypeScript with 2-space indentation
- Named exports for controllers/services
- camelCase for functions/variables
- PascalCase for directories under `src/api/`
- Preserve existing comments; add comments only for non-obvious intent

**Frontend**:
- Tailwind utility classes (avoid custom CSS unless scoped under `.app`)
- Alpine.js component pattern (`x-data` encapsulation)
- Format with Prettier: `pnpm format`
- Use `pnpm` exclusively (not npm/yarn)

**Environment Notes**: If `pnpm` is not in `PATH`, prefix commands with `PATH="$MY_PATH"`, e.g., `PATH="$MY_PATH" which pnpm`.

## Common Gotchas

- **Time Zone Handling**: Time slots use ISO 8601 with explicit timezone offsets (e.g., `2024-12-05T19:30+01:00` for CET). Be aware of daylight saving time shifts when creating slots programmatically.
- **History Snapshots**: Deleting old bookings will break history references. Consider soft-delete patterns if audit trails are critical.
- **Docker Volume Persistence**: Database data persists in `.data/`. Use `docker compose down -v` to reset.
- **Email Previews**: Always check Mailhog (http://localhost:8025) for both HTML and plain-text rendering during template changes.
