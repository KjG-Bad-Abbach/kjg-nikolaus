# Alpine.js Contribution Notes

## Local Setup

- Install dependencies once with `pnpm install`.
- Run `pnpm dev` to start the Laravel Mix watcher; Alpine code in `src/js/app.js` will hot-reload into `dist/`.
- Serve `dist/` through the Docker frontend container (`docker compose up frontend`) or with `pnpm run dev` plus your preferred static server.

## Project Conventions

- Mount all Alpine components from `src/index.html` or partials under `src/`. Use `x-data` objects defined in `src/js/app.js` to keep behaviour discoverable.
- Namespace global stores under `window.Alpine.store('kjg', …)` so additional modules can extend shared state without collisions.
- Keep DOM hooks semantic: prefer `data-testid` for testing handles and keep `x-ref` names lowercase, hyphen-separated.

## Core Directives We Rely On

- `x-data="{ … }"` defines component state; return plain objects with method shorthand for handlers.
- `x-show`, `x-if`, and `x-transition` power conditional UI. Pair `x-transition.opacity.duration.200ms` with Tailwind classes for smooth fades.
- `x-model` binds form inputs; use modifiers like `.debounce.300ms` for throttled API calls.
- Use `x-on:submit.prevent="..."` to keep forms SPA-friendly.

## Shared Utility Patterns

- Register reusable logic in `src/js/app.js` via `Alpine.data('bookingForm', () => ({ … }))`; import helper functions at the top of the file.
- When state spans multiple components (e.g., booking wizard), expose a store:
  ```js
  document.addEventListener("alpine:init", () => {
    Alpine.store("booking", {
      step: 1,
      setStep(step) {
        this.step = step;
      },
      reset() {
        Object.assign(this, { step: 1 });
      },
    });
  });
  ```
- For asynchronous calls into the Strapi backend, wrap `fetch` helpers in `src/js/app.js` and return promises so directives can `await` inside async methods.

## Testing & Debugging

- Use the browser console to inspect component state: `Alpine.store('booking')` or `$el.__x.$data`.
- Tailwind class toggles can be verified by combining `x-bind:class` with template literals for readability.
- Document manual QA steps in pull requests—list which Alpine components you exercised and any edge cases you covered.

## Production Checklist

- Run `pnpm build` to emit the minified bundle prior to deployment; commit only source files, not `dist/`.
- Check for unused directives with the browser’s DOM inspector and remove stale `x-` attributes.
- Keep Alpine version alignment in `package.json`; update alongside Tailwind to avoid breaking changes in directive syntax.

## Attributes

### x-data

Declare a new Alpine component and its data for a block of HTML

```html
<div x-data="{ open: false }">...</div>
```

### x-bind

Dynamically set HTML attributes on an element

```html
<div x-bind:class="! open ? 'hidden' : ''">...</div>
```

### x-on

Listen for browser events on an element

```html
<button x-on:click="open = ! open">Toggle</button>
```

### x-text

Set the text content of an element

```html
<div>
  Copyright ©

  <span x-text="new Date().getFullYear()"></span>
</div>
```

### x-html

Set the inner HTML of an element

```html
<div x-html="(await axios.get('/some/html/partial')).data">...</div>
```

### x-model

Synchronize a piece of data with an input element

```html
<div x-data="{ search: '' }">
  <input type="text" x-model="search" />

  Searching for: <span x-text="search"></span>
</div>
```

### x-show

Toggle the visibility of an element

```html
<div x-show="open">...</div>
```

### x-transition

Transition an element in and out using CSS transitions

```html
<div x-show="open" x-transition>...</div>
```

### x-for

Repeat a block of HTML based on a data set

```html
<template x-for="post in posts">
  <h2 x-text="post.title"></h2>
</template>
```

### x-if

Conditionally add/remove a block of HTML from the page entirely

```html
<template x-if="open">
  <div>...</div>
</template>
```

### x-init

Run code when an element is initialized by Alpine

```html
<div x-init="date = new Date()"></div>
```

### x-effect

Execute a script each time one of its dependencies change

```html
<div x-effect="console.log('Count is '+count)"></div>
```

### x-ref

Reference elements directly by their specified keys using the $refs magic property

```html
<input type="text" x-ref="content" />

<button x-on:click="navigator.clipboard.writeText($refs.content.value)">
  Copy
</button>
```

### x-cloak

Hide a block of HTML until after Alpine is finished initializing its contents

```html
<div x-cloak>...</div>
```

### x-ignore

Prevent a block of HTML from being initialized by Alpine

```html
<div x-ignore>...</div>
```

## Properties

### $store

Access a global store registered using Alpine.store(...)

```html
<h1 x-text="$store.site.title"></h1>
```

### $el

Reference the current DOM element

```html
<div x-init="new Pikaday($el)"></div>
```

### $dispatch

Dispatch a custom browser event from the current element

```html
<div x-on:notify="...">
  <button x-on:click="$dispatch('notify')">...</button>
</div>
```

### $watch

Watch a piece of data and run the provided callback anytime it changes

```html
<div
  x-init="$watch('count', value => {
  console.log('count is ' + value)
})"
>
  ...
</div>
```

### $refs

Reference an element by key (specified using x-ref)

```html
<div x-init="$refs.button.remove()">
  <button x-ref="button">Remove Me</button>
</div>
```

### $nextTick

Wait until the next "tick" (browser paint) to run a bit of code

```html
<div
  x-text="count"
  x-text="$nextTick(() => {"
    console.log('count is ' + $el.textContent)
  })
>...</div>
```

## Methods

### Alpine.data

Reuse a data object and reference it using x-data

```html
<div x-data="dropdown">...</div>

... Alpine.data('dropdown', () => ({ open: false, toggle() { this.open = !
this.open } }))
```

### Alpine.store

Declare a piece of global, reactive, data that can be accessed from anywhere using $store

```html
<button @click="$store.notifications.notify('...')">Notify</button>

... Alpine.store('notifications', { items: [], notify(message) {
this.items.push(message) } })
```
