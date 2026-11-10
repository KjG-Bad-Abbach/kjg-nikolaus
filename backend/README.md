# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
pnpm develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
pnpm start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
pnpm build
```

## Check and apply Strapi codemods

Run these commands from the repository root.
Start with the read-only check:

```sh
pnpm --dir backend strapi:check
```

Every direct `@strapi/*` dependency and devDependency in backend and frontend must match the exact backend `@strapi/strapi` version.
The check also requires `backend/.last-applied-codemods-version` to match that version; the current baseline is `5.0.0`.
CI runs the tooling tests and read-only check before registry login and image builds.

If versions disagree, align the intended exact versions in both manifests and regenerate affected lockfiles.
Do not downgrade packages merely to match the current core.
For a pending interval, the interactive Bash command uses `@strapi/upgrade` pinned to the validated core version through `npx`.
You need existing Bash, Node.js, and npx executors, a writable npm cache, and network access unless the exact tool is already available.
Normal npx download confirmation is preserved: it only prompts when acquisition is needed, and npm configuration or non-interactive execution can suppress it.
Installation hooks and acquired code run with your account's access; prefer a disposable, credential-free environment with trusted executors and configuration.
The read-only check and an already-current marker do not acquire tools.

Preserve a backup of your work and run without credentials, with network access restricted to what acquisition requires:

```sh
pnpm --dir backend strapi:codemods
pnpm --dir backend strapi:check
```

Confirm the complete codemod selection, then inspect each codemod's output and changes before confirming success with zero per-file errors.
A zero exit status does not prove success.
After a failed or unconfirmed result, choose whether to continue; completion then requires a separate confirmation that all such results have been resolved.
The marker advances only after final confirmation, even when no codemods apply, and only if the validated core and baseline remain unchanged.
If codemods change dependency declarations, separately regenerate affected lockfiles with approved tooling before testing or deployment.
Run relevant tests before deployment.
Stopping, declining completion, interruption, or failed validation leaves the marker unchanged, but partial transformations may remain: review changes, fix failures, and retry.
Neither script rolls back or discards your work.
Recover missing or damaged tracking from the correct last-applied baseline while preserving local edits; never manually advance the marker to bypass codemods.

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
pnpm strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
