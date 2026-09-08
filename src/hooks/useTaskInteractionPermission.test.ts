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
          expireDate: "2026-09-09",
          assignedTo: { id: "user-1" },
          task: { status: "pending" },
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
        expireDate: "2026-09-09",
        assignedTo: { id: "user-1" },
        task: { status: "pending" },
      },
    ],
    [
      "is from another user",
      {
        isActive: false,
        expireDate: "2026-09-09",
        assignedTo: { id: "user-2" },
        task: { status: "pending" },
      },
    ],
    [
      "is no longer pending",
      {
        isActive: false,
        expireDate: "2026-09-09",
        assignedTo: { id: "user-1" },
        task: { status: "completed" },
      },
    ],
    [
      "is due today",
      {
        isActive: false,
        expireDate: "2026-09-04",
        assignedTo: { id: "user-1" },
        task: { status: "pending" },
      },
    ],
  ] as const)("does not permit a task that %s", (_reason, task) => {
    expect(canExecuteScheduledTaskEarly(task, "user-1", today)).toBe(false);
  });
});
