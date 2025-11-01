import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import vm from "vm";

interface BookingScriptContext extends vm.Context {
  __runAlpineInit?: () => void;
  __getAlpineComponent?: (name: string) => (() => unknown) | undefined;
}

const scriptCache: { source?: string } = {};

const resolveScriptSource = () => {
  if (scriptCache.source) {
    return scriptCache.source;
  }
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const htmlPath = path.resolve(__dirname, "../../src/index.html");
  const html = readFileSync(htmlPath, "utf8");
  const match = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/i);
  if (!match) {
    throw new Error("Booking wizard inline script not found in index.html");
  }
  scriptCache.source = match[1];
  return scriptCache.source;
};

export const loadBookingScript = (): BookingScriptContext => {
  const noop = () => {};
  const components = new Map<string, () => unknown>();
  let alpineInitHandler: (() => void) | null = null;

  const sandbox: BookingScriptContext = {
    console,
    setInterval: noop,
    clearInterval: noop,
    setTimeout: noop,
    clearTimeout: noop,
    URLSearchParams,
    Date,
    Array,
    JSON,
    Math,
    Number,
    String,
    Boolean,
    RegExp,
    Object,
    Map,
    WeakMap,
    Set,
    WeakSet,
    Error,
    document: {
      addEventListener: (event: string, handler: () => void) => {
        if (event === "alpine:init") {
          alpineInitHandler = handler;
        }
      },
      removeEventListener: noop,
      querySelector: () => ({ innerHTML: "" }),
    },
    window: {} as Record<string, unknown>,
    API_TOKEN: undefined,
    API_BASE_URL: undefined,
    fetch: async () => {
      throw new Error("fetch is not stubbed in loadBookingScript");
    },
    confirm: () => true,
    Alpine: {
      data(name: string, factory: () => unknown) {
        components.set(name, factory);
      },
      store: noop,
    },
    __runAlpineInit: () => {
      if (typeof alpineInitHandler === "function") {
        alpineInitHandler();
      }
    },
    __getAlpineComponent: (name: string) => components.get(name),
  };

  sandbox.window = {
    addEventListener: noop,
    removeEventListener: noop,
    location: { search: "" },
    document: sandbox.document,
    confirm: sandbox.confirm,
    setInterval: sandbox.setInterval,
    clearInterval: sandbox.clearInterval,
  } as typeof sandbox.window;

  (sandbox.window as Record<string, unknown>).window = sandbox.window;

  const context = vm.createContext(sandbox);
  const source = resolveScriptSource();
  vm.runInContext(source, context);
  vm.runInContext(
    "this.__bookingExports = { formatDateTimeRange, formatTimeSlotGroup, RichTextBlocksRenderer, formatDate, formatTime };",
    context,
  );

  return context;
};
