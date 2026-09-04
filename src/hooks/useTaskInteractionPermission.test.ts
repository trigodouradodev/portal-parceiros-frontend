import {
  canExecuteScheduledTaskEarly,
  canInteractWithTask,
} from "@/hooks/useTaskInteractionPermission";

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

describe("canExecuteScheduledTaskEarly", () => {
  const today = new Date(2026, 8, 4);

  it("only permits a future, pending scheduled task assigned to the user", () => {
    expect(
      canExecuteScheduledTaskEarly(
        {
          isActive: false,
          status: "pending",
          expireDate: "2026-09-09",
          assignedTo: { id: "user-1" },
        },
        "user-1",
        today,
      ),
    ).toBe(true);
  });

  it.each([
    [
      "is active",
      {
        isActive: true,
        status: "pending",
        expireDate: "2026-09-09",
        assignedTo: { id: "user-1" },
      },
    ],
    [
      "is from another user",
      {
        isActive: false,
        status: "pending",
        expireDate: "2026-09-09",
        assignedTo: { id: "user-2" },
      },
    ],
    [
      "is no longer pending",
      {
        isActive: false,
        status: "completed",
        expireDate: "2026-09-09",
        assignedTo: { id: "user-1" },
      },
    ],
    [
      "is due today",
      {
        isActive: false,
        status: "pending",
        expireDate: "2026-09-04",
        assignedTo: { id: "user-1" },
      },
    ],
  ])("does not permit a task that %s", (_reason, task) => {
    expect(canExecuteScheduledTaskEarly(task, "user-1", today)).toBe(false);
  });
});
