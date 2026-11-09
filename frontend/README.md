# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

From `frontend/`, copy `.env.example` to `.env.local` and set your Strapi URL before starting or building the app.
Use only a browser-public, least-privilege token if your Strapi permissions require one; never use an admin token.
Restart the dev server or rebuild after changing these values.

Once you've created a project and installed dependencies with `pnpm install`, start a development server:

```sh
pnpm dev

# or start the server and open the app in a new browser tab
pnpm dev -- --open
```

## Building

To create a production version of your app:

```sh
pnpm build
```

You can preview the production build with `pnpm preview`.

## Testing

Run `pnpm test:e2e` for the browser smoke tests; these supply their own configuration response and do not require Strapi.
They do not verify backend integration or booking-flow parity.

Inside the development container, reload the project's Nix shell after changes to `shell.nix` before running browser tests.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
