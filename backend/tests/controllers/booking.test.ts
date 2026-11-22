import { describe, expect, it, vi } from "vitest";
import createBookingController from "@/api/booking/controllers/booking";

vi.mock("@strapi/strapi", () => ({
  factories: {
    createCoreController: (_uid: string, extension: unknown) => extension,
  },
}));

function createHarness(config: Record<string, unknown> | null) {
  const core = {
    create: vi.fn(async () => ({ data: { documentId: "booking-document" } })),
    update: vi.fn(async () => ({ data: { documentId: "booking-document" } })),
  };
  const service = { clean: vi.fn(), addHistoryEntry: vi.fn() };
  const strapi = {
    documents: vi.fn(() => ({ findFirst: vi.fn(async () => config) })),
    service: vi.fn(() => service),
  };
  const controller = (
    createBookingController as unknown as (context: { strapi: unknown }) => {
      create: (ctx: unknown) => Promise<unknown>;
      update: (ctx: unknown) => Promise<unknown>;
      sanitizeInput: (data: unknown) => Promise<unknown>;
    }
  )({ strapi });
  Object.setPrototypeOf(controller, core);
  controller.sanitizeInput = vi.fn(async (data) => data);
  const ctx = {
    request: { body: { data: {} } },
    params: { id: "booking-document" },
    throw: vi.fn((status: number, message: string) => {
      throw Object.assign(new Error(message), { status });
    }),
  };
  return { controller, core, ctx, service };
}

describe.each(["create", "update"] as const)("%s", (action) => {
  it.each([
    null,
    { route_planning_deadline: null, final_deadline: null },
    { route_planning_deadline: null, final_deadline: "2099-12-05" },
    { route_planning_deadline: "2099-12-01", final_deadline: null },
  ])(
    "bookingWrite_UnsetDeadlines_Expect_ForbiddenBeforeMutation",
    async (config) => {
      // Arrange
      const { controller, core, ctx, service } = createHarness(config);

      // Act
      const result = controller[action](ctx);

      // Assert
      await expect(result).rejects.toMatchObject({
        status: 403,
        message:
          "Booking and editing are closed until both deadlines are configured.",
      });
      expect(core[action]).not.toHaveBeenCalled();
      expect(service.clean).not.toHaveBeenCalled();
      expect(service.addHistoryEntry).not.toHaveBeenCalled();
    }
  );

  it("bookingWrite_ConfiguredDeadlines_Expect_ExistingWriteAndHistoryFlow", async () => {
    // Arrange
    const { controller, core, ctx, service } = createHarness({
      route_planning_deadline: "2099-12-01",
      final_deadline: "2099-12-05",
    });

    // Act
    await controller[action](ctx);

    // Assert
    expect(core[action]).toHaveBeenCalledExactlyOnceWith(ctx);
    expect(service.addHistoryEntry).toHaveBeenCalledExactlyOnceWith(
      "booking-document",
      {}
    );
  });
});
