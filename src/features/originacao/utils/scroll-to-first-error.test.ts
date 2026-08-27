import { describe, expect, it, vi, afterEach } from "vitest";
import { fieldElementId } from "@/components/ui/field-hint";
import {
  ORIGINACAO_TASK_SCROLL_ID,
  firstErrorPath,
  nearestScrollableParent,
  scrollToField,
} from "@/features/originacao/utils/scroll-to-first-error";

describe("firstErrorPath", () => {
  it("returns the first nested field with a message", () => {
    expect(
      firstErrorPath({
        registration: {
          gender: { type: "manual", message: "Campo obrigatório" },
        },
      }),
    ).toBe("registration.gender");
  });

  it("prefers earlier keys in object order", () => {
    expect(
      firstErrorPath({
        name: { type: "manual", message: "Informe o nome" },
        cpf: { type: "manual", message: "CPF inválido" },
      }),
    ).toBe("name");
  });
});

describe("nearestScrollableParent", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("uses the tagged task scroller when the field is inside it", () => {
    const scroller = document.createElement("div");
    scroller.id = ORIGINACAO_TASK_SCROLL_ID;
    const field = document.createElement("div");
    field.id = fieldElementId("guarantor.name") ?? "";
    scroller.append(field);
    document.body.append(scroller);

    expect(nearestScrollableParent(field)).toBe(scroller);
  });
});

describe("scrollToField", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    vi.unstubAllGlobals();
  });

  it("scrolls the task container to the field", () => {
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });

    const scroller = document.createElement("div");
    scroller.id = ORIGINACAO_TASK_SCROLL_ID;
    Object.defineProperty(scroller, "scrollTo", {
      value: vi.fn(),
    });
    const field = document.createElement("div");
    field.id = fieldElementId("guarantor.name") ?? "";
    const input = document.createElement("input");
    field.append(input);
    scroller.append(field);
    document.body.append(scroller);

    scrollToField("guarantor.name");

    expect(scroller.scrollTo).toHaveBeenCalled();
  });
});
