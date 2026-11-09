# Nikolaus booking frontend

The Svelte frontend uses the existing Strapi API and builds to static files.
All commands below run from `frontend/` unless stated otherwise.

## Develop locally

Use Node.js 22 and pnpm, then prepare the frontend:

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Set the browser-reachable Strapi origin in `.env.local`, without `/api` or a trailing slash.
Use only a browser-public, least-privilege token if Strapi permissions require one; never use an admin token, private key, or backend secret.

```sh
pnpm dev --host 0.0.0.0 --port 3000 --strictPort
```

Open <http://localhost:3000> with Strapi running at the configured origin.
Allow the frontend origin in the backend's CORS configuration when using separate origins.
Vite exposes `VITE_API_BASE_URL` and `VITE_API_TOKEN` to the browser; restart development or rebuild production assets after changing them.

For the existing Docker development stack, run `docker compose up --build` from the repository root.
The frontend service maps root `.env` settings `API_BASE_URL` and `API_TOKEN` to the corresponding `VITE_*` variables without mounting backend secrets into the frontend.
An unset or empty `API_BASE_URL` defaults to `http://localhost:1337`; an unset or empty `API_TOKEN` sends no bearer token unless supplied by the API configuration response.
The URL must be reachable by the browser, not a Docker-only hostname such as `backend`.
The frontend remains at <http://localhost:3000>; Vite replaces BrowserSync, so port 3001 is no longer used.
Recreate the frontend container after changing root API settings.

## Check and test

```sh
pnpm check
pnpm lint
pnpm test:unit
pnpm test:e2e
```

Unit tests include coverage and browser component tests.
Browser tests require provisioned Playwright Chromium and Firefox browsers; the E2E command builds and starts its own preview server on port 4173.
The booking regression suite uses fixtures rather than a live Strapi service, so passing it does not prove real email delivery.
For live verification, create a booking, follow its verification link, reload it, and request a verification resend against Strapi; inspect notification output at <http://localhost:8025> when using the development stack's Mailhog.
Inside the development container, reload the project's Nix shell after changes to `shell.nix` before running browser tests.

## Build and deploy static files

```sh
pnpm build
pnpm preview
```

The existing static adapter writes `build/`, which can be served by a static web server.
Preview is available at <http://localhost:4173>.
Local builds read `.env.local`; production Docker builds exclude all `.env*` files and accept public configuration explicitly as build arguments:

```sh
docker build -f Dockerfile.prod \
  --build-arg VITE_API_BASE_URL=https://api.example.org \
  --build-arg VITE_API_TOKEN= \
  -t kjg-nikolaus-frontend:prod .
docker run --rm -p 3000:80 kjg-nikolaus-frontend:prod
```

The production image serves `build/` through Nginx on port 80.
Build arguments are browser-public and may also appear in build metadata; never supply secrets.
Runtime container environment variables cannot reconfigure the generated assets: rebuild the image to change API settings.
Without a base URL, requests use same-origin `/api/`; the static image does not proxy the API.
The existing CI workflow targets `frontend/Dockerfile.prod` without build arguments, so its deployment must already route same-origin `/api/` to Strapi or supply public build arguments in CI.
No Alpine directory is needed for development, builds, tests, or either image.
