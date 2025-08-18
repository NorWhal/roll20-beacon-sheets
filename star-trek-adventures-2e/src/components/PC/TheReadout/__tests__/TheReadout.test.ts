import { createTestingPinia } from "@pinia/testing";
import userEvent from "@testing-library/user-event";
import { cleanup, render, screen } from "@testing-library/vue";
import { setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { useRollStore } from "@/sheet/stores/rollStore/rollStore";
import { useStatsStore } from "@/sheet/stores/statsStore/statsStore";
import TheReadout from "../TheReadout.vue";

function doRender() {
  const mounted = render(TheReadout, {});
  return mounted;
}

const fakeRollResult = {
  type: "rollResults",
  requestId: "92bd4a3f-1ef9-420e-8fc0-c431d2d0a890",
  messageId: "4dda4e66-bcf7-4104-9bbb-9c467bf958ed",
  results: {
    roll: {
      rollName: "roll",
      expression: "2d20<14",
      results: {
        result: 2,
        dice: [6, 14],
        expression: "2d20<14",
        rolls: [
          {
            sides: 20,
            dice: 2,
            results: [6, 14],
          },
        ],
      },
    },
  },
};

const mocks = vi.hoisted(() => ({
  dispatchRef: {
    value: {
      roll: vi.fn(),
      post: vi.fn(),
    },
  },
  initValues: {},
}));

vi.mock("@/relay/relay", () => {
  return {
    dispatchRef: mocks.dispatchRef,
    initValues: mocks.initValues,
  };
});

describe("theReadout", () => {
  beforeEach(() => {
    cleanup();
    setActivePinia(
      createTestingPinia({
        createSpy: vi.fn,
        stubActions: false,
        stubPatch: false,
      }),
    );
  });

  it("should reactively display the active stats, or show nothing if stat is undefined", async () => {
    const rollStore = useRollStore();
    doRender();

    expect(screen.queryByLabelText("Department")).toBeNull();
    expect(screen.queryByLabelText("Attribute")).toBeNull();
    expect(screen.queryByLabelText("Focus")).toBeNull();

    rollStore.activeStats.department = "CONN";
    await nextTick();
    const department = screen.getByLabelText<HTMLInputElement>("Department");
    expect(department.value).toBe("Conn");

    rollStore.activeStats.attribute = "DARING";
    await nextTick();
    const attribute = screen.getByLabelText<HTMLInputElement>("Attribute");
    expect(attribute.value).toBe("Daring");

    rollStore.activeStats.focus = "Warp Field Mechanics";
    await nextTick();
    const focus = screen.getByLabelText<HTMLInputElement>("Focus");
    expect(focus.value).toBe("Warp Field Mechanics");
  });

  it("should have a button that clears the active attributes", async () => {
    const rollStore = useRollStore();
    rollStore.activeStats.department = "CONN";
    rollStore.activeStats.attribute = "DARING";
    rollStore.activeStats.focus = "Warp Field Mechanics";
    doRender();
    await userEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(rollStore.activeStats).toEqual(
      expect.not.objectContaining({
        department: expect.anything(),
      }),
    );
    expect(rollStore.activeStats).toEqual(
      expect.not.objectContaining({
        attribute: expect.anything(),
      }),
    );
    expect(rollStore.activeStats).toEqual(
      expect.objectContaining({
        focus: "",
      }),
    );
  });

  it("should have a roll button that rolls an assembled roll", async () => {
    const statsStore = useStatsStore();
    statsStore.departmentFields.CONN.base = 4;
    statsStore.attributeFields.DARING.base = 10;
    const rollStore = useRollStore();
    rollStore.activeStats.department = "CONN";
    rollStore.activeStats.attribute = "DARING";
    rollStore.activeStats.baseDice = 2;
    doRender();
    mocks.dispatchRef.value.roll.mockResolvedValueOnce(fakeRollResult);
    await userEvent.click(screen.getByRole("button", { name: "Roll" }));
    expect(mocks.dispatchRef.value.roll).toHaveBeenCalledWith({ rolls: { roll: `2d20<14cs<2` } });
  });

  describe("save button", () => {
    it("should say save when the active stats don't match a saved roll", () => {
      const rollStore = useRollStore();
      rollStore.activeStats.department = "CONN";
      rollStore.activeStats.attribute = "DARING";
      rollStore.activeStats.baseDice = 2;
      doRender();
      screen.getByRole("button", { name: "Save" });
    });
    it("should say delete when the active stats match a saved roll", () => {
      const rollStore = useRollStore();
      rollStore.activeStats.department = "CONN";
      rollStore.activeStats.attribute = "DARING";
      rollStore.activeStats.baseDice = 2;
      rollStore.activeName = "test-roll";
      rollStore.saveRoll();
      doRender();
      screen.getByRole("button", { name: "Delete Roll" });
      expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
    });
  });
});
