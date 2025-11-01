import { Page } from "@playwright/test";
import {
  BookingRecord,
  BookingScenario,
  ScenarioFailure,
  TimeSlotRecord,
} from "./types";

const HOOK_GLOBAL = "__bookingTestApi";
const STORAGE_PREFIX = "__bookingTestApiState__";

const serialize = (scenario: BookingScenario) => JSON.stringify(scenario);

export const registerScenario = async (
  page: Page,
  scenario: BookingScenario,
) => {
  page.on("dialog", (dialog) => dialog.accept());
  const storageKey = `${STORAGE_PREFIX}${Date.now()}_${Math.random().toString(16).slice(2)}`;

  await page.addInitScript(
    ({ rawScenario, hookName, storageKey }) => {
      const deepClone = (value: unknown) => JSON.parse(JSON.stringify(value));
      const normalizeBooking = (booking: BookingRecord): BookingRecord => ({
        documentId: booking.documentId,
        contact_person: deepClone(booking.contact_person),
        location: deepClone(booking.location),
        present_location: booking.present_location || "",
        children: deepClone(booking.children || []),
        time_slots: deepClone(booking.time_slots || []).map((slot: unknown) =>
          typeof slot === "string" ? { documentId: slot } : slot,
        ),
        additional_notes: booking.additional_notes || "",
        email_resend_count: booking.email_resend_count || 0,
      });

      const loadPersistedState = () => {
        try {
          const stored = sessionStorage.getItem(storageKey);
          if (!stored) {
            return null;
          }
          return JSON.parse(stored) as {
            config: BookingScenario["config"];
            bookings: Record<string, BookingRecord>;
            timeSlots: TimeSlotRecord[];
            sequence: number;
            failures: ScenarioFailure[];
          };
        } catch (error) {
          console.warn(
            "[Nikolaus Booking] Failed to read persisted booking state",
            error,
          );
          return null;
        }
      };

      const initial = JSON.parse(rawScenario) as BookingScenario;

      const createInitialState = () => ({
        config: deepClone(initial.config),
        bookings: Object.fromEntries(
          (initial.bookings || []).map((booking) => [
            booking.documentId,
            normalizeBooking(booking),
          ]),
        ),
        timeSlots: deepClone(initial.timeSlots || []),
        sequence: initial.nextBookingSeq || (initial.bookings?.length || 0) + 1,
        failures: deepClone(initial.failures || []),
      });

      const persisted = loadPersistedState();

      const state = (
        persisted
          ? {
              config: deepClone(persisted.config || initial.config),
              bookings: Object.fromEntries(
                Object.entries(persisted.bookings || {}).map(
                  ([id, booking]) => [
                    id,
                    normalizeBooking(booking as BookingRecord),
                  ],
                ),
              ),
              timeSlots: deepClone(
                persisted.timeSlots || initial.timeSlots || [],
              ),
              sequence:
                typeof persisted.sequence === "number"
                  ? persisted.sequence
                  : initial.nextBookingSeq ||
                    (initial.bookings?.length || 0) + 1,
              failures: deepClone(persisted.failures || initial.failures || []),
            }
          : createInitialState()
      ) as {
        config: BookingScenario["config"];
        bookings: Record<string, BookingRecord>;
        timeSlots: TimeSlotRecord[];
        sequence: number;
        failures: ScenarioFailure[];
      };

      const persistState = () => {
        try {
          sessionStorage.setItem(
            storageKey,
            JSON.stringify({
              config: deepClone(state.config),
              bookings: deepClone(state.bookings),
              timeSlots: deepClone(state.timeSlots),
              sequence: state.sequence,
              failures: deepClone(state.failures),
            }),
          );
        } catch (error) {
          console.warn(
            "[Nikolaus Booking] Failed to persist booking state",
            error,
          );
        }
      };

      persistState();

      const makeBookingId = () => `booking-${state.sequence++}`;

      const maybeFail = (stage: ScenarioFailure["stage"]) => {
        const idx = state.failures.findIndex((f) => f.stage === stage);
        if (idx >= 0) {
          const failure = state.failures[idx];
          if (failure.once) {
            state.failures.splice(idx, 1);
            persistState();
          }
          throw deepClone({
            message: failure.error.message,
            status: failure.error.status,
            body: failure.error.body,
          });
        }
      };

      const ensureBooking = (documentId: string) => {
        const booking = state.bookings[documentId];
        if (!booking) {
          const error = {
            message: "Booking not found",
            status: { code: 404, text: "Not Found" },
            body: { error: { name: "NotFoundError" } },
          };
          throw error;
        }
        return booking;
      };

      const mergeBooking = (
        booking: BookingRecord,
        payload: Partial<BookingRecord>,
      ) => {
        if (!payload) return;
        if (payload.contact_person) {
          booking.contact_person = {
            ...booking.contact_person,
            ...payload.contact_person,
          };
        }
        if (payload.location) {
          booking.location = {
            ...booking.location,
            ...payload.location,
          };
        }
        if (payload.present_location !== undefined) {
          booking.present_location = payload.present_location;
        }
        if (payload.children) {
          booking.children = payload.children.map((child) => ({ ...child }));
        }
        if (payload.time_slots) {
          booking.time_slots = payload.time_slots.map((slot) => {
            if (typeof slot === "string") {
              return { documentId: slot } as { documentId: string };
            }
            return { documentId: (slot as { documentId: string }).documentId };
          });
        }
        if (payload.additional_notes !== undefined) {
          booking.additional_notes = payload.additional_notes;
        }
        if (payload.email_resend_count !== undefined) {
          booking.email_resend_count = payload.email_resend_count;
        }
      };

      const respond = (data: unknown) => ({ data: deepClone(data) });

      const handlers = {
        async getConfig() {
          maybeFail("config");
          return respond(state.config);
        },
        async listTimeSlots() {
          maybeFail("time-slot-fetch");
          return respond(state.timeSlots);
        },
        async createBooking(body: { data: Partial<BookingRecord> }) {
          maybeFail("contact-save");
          const documentId = makeBookingId();
          const booking = normalizeBooking({
            documentId,
            contact_person: {
              first_name: "",
              last_name: "",
              email: "",
              phone_number: "",
            },
            location: {
              street: "",
              house_number: "",
              zip_code: "",
              place: "",
            },
            present_location: "",
            children: [],
            time_slots: [],
            additional_notes: "",
            email_resend_count: 0,
            ...deepClone(body?.data || {}),
          });
          state.bookings[documentId] = booking;
          persistState();
          return respond(booking);
        },
        async updateBooking(
          documentId: string,
          body: { data: Partial<BookingRecord> },
        ) {
          const booking = ensureBooking(documentId);
          const payload = body?.data || {};
          if (payload.location) {
            maybeFail("address-save");
          }
          if (payload.time_slots) {
            maybeFail("time-slot-save");
          }
          if (payload.children || payload.additional_notes !== undefined) {
            maybeFail("children-save");
          }
          mergeBooking(booking, deepClone(payload));
          persistState();
          return respond(booking);
        },
        async getBooking(documentId: string) {
          maybeFail("booking-fetch");
          const booking = ensureBooking(documentId);
          return respond(booking);
        },
        async sendVerification(documentId: string) {
          maybeFail("send-verification");
          const booking = ensureBooking(documentId);
          booking.email_resend_count = (booking.email_resend_count || 0) + 1;
          persistState();
          return { ok: true };
        },
      };

      const parseUrl = (url: string) => {
        const [path] = url.split("?");
        return path;
      };

      const handleRequest = async ({
        url,
        method,
        body,
      }: {
        url: string;
        method: string;
        body?: unknown;
      }) => {
        const path = parseUrl(url);
        if (method === "GET" && path.startsWith("config")) {
          return handlers.getConfig();
        }
        if (method === "GET" && path.startsWith("time-slots")) {
          return handlers.listTimeSlots();
        }
        if (method === "POST" && path === "bookings") {
          return handlers.createBooking(
            body as { data: Partial<BookingRecord> },
          );
        }
        if (method === "PUT" && path.startsWith("bookings/")) {
          const [, id] = path.split("/");
          return handlers.updateBooking(
            id,
            body as { data: Partial<BookingRecord> },
          );
        }
        if (method === "GET" && path.startsWith("bookings/")) {
          const [, id] = path.split("/");
          return handlers.getBooking(id);
        }
        if (
          method === "POST" &&
          path.startsWith("bookings/") &&
          path.endsWith("send-verification-email")
        ) {
          const [, id] = path.split("/");
          return handlers.sendVerification(id);
        }
        throw {
          message: `Unhandled stub request for ${method} ${url}`,
          status: { code: 400, text: "Bad Request" },
        };
      };

      Object.defineProperty(window, hookName, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: {
          handleRequest,
          inspectState: () => deepClone(state),
        },
      });
    },
    { rawScenario: serialize(scenario), hookName: HOOK_GLOBAL, storageKey },
  );
};
