import { canInteractWithTask } from "@/hooks/useTaskInteractionPermission";

describe("canInteractWithTask", () => {
  it("only permits an active task assigned to the current user", () => {
    expect(
      canInteractWithTask(
        { isActive: true, assignedTo: { id: "user-1" } },
        "user-1",
      ),
    ).toBe(true);
    expect(
      canInteractWithTask(
        { isActive: true, assignedTo: { id: "user-2" } },
        "user-1",
      ),
    ).toBe(false);
    expect(
      canInteractWithTask(
        { isActive: false, assignedTo: { id: "user-1" } },
        "user-1",
      ),
    ).toBe(false);
  });
});
