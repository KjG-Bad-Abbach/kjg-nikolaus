import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadBookingScript } from "./loadBookingScript.ts";

type BookingContext = ReturnType<typeof loadBookingScript> & {
  [key: string]: any;
};

describe("booking wizard helpers", () => {
  let ctx: BookingContext;

  beforeEach(() => {
    ctx = loadBookingScript();
  });

  it("trims whitespace and soft hyphen characters", () => {
    const { trim, isFilled } = ctx;
    expect(trim("  Nikolaus ")).toBe("Nikolaus");
    expect(trim("\u00ADNi\u00ADkolaus\u00AD")).toBe("Nikolaus");
    expect(isFilled("   ")).toBe(false);
    expect(isFilled("  Bad Abbach  ")).toBe(true);
  });

  it("updates existing object keys across types", () => {
    const { updateExistingObjectKeys } = ctx;
    const target = {
      stringValue: "original",
      nested: {
        child: "value",
        when: new Date("2024-12-05T17:30:00.000Z"),
      },
      list: ["slot-1"],
    };
    const source = {
      stringValue: "updated",
      nested: {
        child: "changed",
        when: "2030-12-06T18:00:00.000Z",
      },
      list: ["slot-2", "slot-3"],
    };

    updateExistingObjectKeys(target, source);

    expect(target.stringValue).toBe("updated");
    expect(target.nested.child).toBe("changed");
    expect(target.nested.when).toBeInstanceOf(Date);
    expect((target.nested.when as Date).toISOString()).toBe(
      "2030-12-06T18:00:00.000Z",
    );
    expect(target.list).toEqual(["slot-2", "slot-3"]);
  });

  it("extends existing object keys and handles unknown key types", () => {
    const { extendExistingObjectKeys } = ctx;
    const target = {
      message: "Frohe",
      nested: { greeting: "Nikolaus" },
      list: ["slot-1"],
    };
    const source = {
      message: "Weihnachten",
      nested: { greeting: "Besuch" },
      list: ["slot-2"],
    };

    extendExistingObjectKeys(target, source);

    expect(target.message).toBe("Frohe Weihnachten");
    expect(target.nested.greeting).toBe("Nikolaus Besuch");
    expect(target.list).toEqual(["slot-1", "slot-2"]);

    expect(() =>
      extendExistingObjectKeys(
        { count: 1 },
        {
          count: 2,
        },
      ),
    ).toThrowError("Unknown key type");
  });

  it("formats date ranges with and without year suffix", () => {
    const { formatDateTimeRange, formatTimeSlotGroup } = ctx.__bookingExports;
    const now = new Date();
    const sameDayStart = new Date(
      Date.UTC(now.getFullYear(), 5, 10, 17, 30, 0),
    );
    const sameDayEnd = new Date(Date.UTC(now.getFullYear(), 5, 10, 18, 15, 0));
    const rangeSameDay = formatDateTimeRange(sameDayStart, sameDayEnd);
    expect(rangeSameDay.endsWith("Uhr")).toBe(true);
    expect(rangeSameDay).toContain(" - ");
    expect(rangeSameDay).not.toContain(now.getFullYear().toString());

    const previousYear = now.getFullYear() - 2;
    const crossDayStart = new Date(Date.UTC(previousYear, 11, 31, 22, 30, 0));
    const crossDayEnd = new Date(Date.UTC(previousYear + 1, 0, 1, 0, 15, 0));
    const rangeCrossDay = formatDateTimeRange(crossDayStart, crossDayEnd);
    expect(rangeCrossDay).toContain(previousYear.toString());
    expect(rangeCrossDay).toContain((previousYear + 1).toString());

    const formattedGroup = formatTimeSlotGroup(sameDayStart);
    expect(formattedGroup).toContain(".");
    expect(formattedGroup).toContain(" ");
  });

  it("renders rich-text SCL blocks with full formatting coverage", () => {
    const { RichTextBlocksRenderer } = ctx.__bookingExports;
    const renderer = new RichTextBlocksRenderer(
      [
        {
          type: "heading",
          level: 2,
          children: [{ text: "Nikolaus Übersicht" }],
        },
        {
          type: "paragraph",
          children: [{ text: "Willkommen zum Fest" }],
        },
        {
          type: "list",
          format: "ordered",
          indentLevel: 1,
          children: [
            {
              type: "list-item",
              children: [
                {
                  text: "Code",
                  code: true,
                  bold: true,
                  italic: true,
                  underline: true,
                  strikethrough: true,
                },
              ],
            },
          ],
        },
        {
          type: "list",
          format: "unordered",
          indentLevel: 5,
          children: [
            {
              type: "list-item",
              children: [
                {
                  type: "link",
                  url: "https://example.org",
                  children: [{ text: "Mehr erfahren" }],
                },
              ],
            },
          ],
        },
        {
          type: "unknown",
          children: [{ text: "Fallback Text" }],
        },
      ],
      {
        extend: {
          heading2: "text-calypso",
          list: "text-java",
          link: "text-atlantis",
        },
      },
    );

    const html = renderer.render();
    expect(html).toContain("<h2");
    expect(html).toContain("text-calypso");
    expect(html).toContain('<p class="');
    expect(html).toMatch(/<ol class="[^"]*list-\[lower-alpha]/);
    expect(html).toMatch(/<ul class="[^"]*list-square/);
    expect(html).toMatch(
      /<code class="bg-gray-100 rounded-sm px-1 font-mono">Code<\/code>/,
    );
    expect(html).toContain("<strong");
    expect(html).toContain("<em");
    expect(html).toContain("underline");
    expect(html).toContain("line-through");
    expect(html).toContain("text-atlantis");
    expect(html).toContain("Fallback Text");
  });

  it("handles unsaved changes callback wiring", () => {
    const { registerCheckHasUnsavedChangesCallback, handleUnsavedChanges } =
      ctx;
    const event: { returnValue?: string } = {};

    registerCheckHasUnsavedChangesCallback(() => true);
    const message = handleUnsavedChanges(event, "verlassen");
    expect(message).toContain("verlassen");
    expect(event.returnValue).toBe(message);

    registerCheckHasUnsavedChangesCallback(() => false);
    expect(handleUnsavedChanges(event, "neu laden")).toBeUndefined();
  });

  it("detects booking changes across nested structures", () => {
    ctx.__runAlpineInit?.();
    const bookingFactory = ctx.__getAlpineComponent?.("bookingForm");
    if (!bookingFactory) {
      throw new Error("bookingForm Alpine component was not registered");
    }
    const bookingForm = bookingFactory();
    const baseline = ctx.clone(bookingForm.bookingEmpty());
    bookingForm.booking = ctx.clone(baseline);
    bookingForm.bookingLoadedFromDatabase = ctx.clone(baseline);

    expect(bookingForm.bookingHasChanges()).toBe(false);

    bookingForm.booking.contact_person.first_name = "Ada";
    expect(bookingForm.bookingHasChanges()).toBe(true);

    bookingForm.booking = ctx.clone(baseline);
    bookingForm.bookingLoadedFromDatabase = ctx.clone(baseline);
    bookingForm.booking.children.push({
      name: "",
      identification_trait: "",
      speech: "",
    });
    expect(bookingForm.bookingHasChanges()).toBe(true);

    bookingForm.booking = ctx.clone(baseline);
    bookingForm.bookingLoadedFromDatabase = ctx.clone(baseline);
    bookingForm.booking.additional_notes = "";
    expect(bookingForm.bookingHasChanges()).toBe(false);
  });

  it("maintains sorted time-slot selections respecting arithmetic precedence", () => {
    ctx.__runAlpineInit?.();
    const factory = ctx.__getAlpineComponent?.("bookingForm");
    if (!factory) {
      throw new Error("bookingForm Alpine component was not registered");
    }
    const form = factory();
    const slots = [
      {
        id: "slot-3",
        label: "Late",
        start: new Date("2030-12-06T19:00:00.000Z"),
        end: new Date("2030-12-06T19:45:00.000Z"),
        max_bookings: 3,
        max_reservations: 3,
        available_reservations: 1,
        isSelected: false,
      },
      {
        id: "slot-1",
        label: "Early",
        start: new Date("2030-12-06T16:00:00.000Z"),
        end: new Date("2030-12-06T16:45:00.000Z"),
        max_bookings: 3,
        max_reservations: 3,
        available_reservations: 2,
        isSelected: false,
      },
      {
        id: "slot-2",
        label: "Prime",
        start: new Date("2030-12-06T17:00:00.000Z"),
        end: new Date("2030-12-06T17:45:00.000Z"),
        max_bookings: 3,
        max_reservations: 3,
        available_reservations: 0,
        isSelected: false,
      },
    ];
    form.availableTimeSlots = slots;
    form.selectedTimeSlotIds = [];

    form.updateTimeSlot("slot-3", true);
    expect(form.selectedTimeSlotIds).toEqual(["slot-3"]);

    form.updateTimeSlot("slot-1", true);
    expect(form.selectedTimeSlotIds).toEqual(["slot-1", "slot-3"]);

    form.updateTimeSlot("slot-2", true);
    expect(form.selectedTimeSlotIds).toEqual(["slot-1", "slot-2", "slot-3"]);

    form.updateTimeSlot("slot-2", false);
    expect(form.selectedTimeSlotIds).toEqual(["slot-1", "slot-3"]);
    expect(slots.find((slot) => slot.id === "slot-2")?.isSelected).toBe(false);
  });

  it("respects confirmation flow when stepping with unsaved changes", async () => {
    ctx.__runAlpineInit?.();
    const factory = ctx.__getAlpineComponent?.("bookingForm");
    if (!factory) {
      throw new Error("bookingForm Alpine component was not registered");
    }
    const form = factory();
    form.canJumpToAnyStep = true;
    form.booking = form.bookingEmpty();
    form.bookingLoadedFromDatabase = ctx.clone(form.bookingEmpty());

    const confirmSpy = vi.spyOn(ctx, "confirm").mockReturnValue(false);
    const bookingHasChangesSpy = vi
      .spyOn(form, "bookingHasChanges")
      .mockReturnValue(true);
    const fetchSpy = vi
      .spyOn(form, "fetchTimeSlots")
      .mockResolvedValue(undefined);

    await form.setStep(2);
    expect(form.step).toBe(0);
    expect(confirmSpy).toHaveBeenCalled();

    confirmSpy.mockReturnValue(true);
    await form.setStep(2);
    expect(form.step).toBe(2);
    confirmSpy.mockRestore();
    bookingHasChangesSpy.mockRestore();
    fetchSpy.mockRestore();
  });
});
