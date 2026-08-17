import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Calendar } from "@/components/ui/calendar";

const selected = new Date(2026, 2, 15);
const minDate = new Date(2020, 0, 1);
const maxDate = new Date(2026, 11, 31);

describe("Calendar month and year picker", () => {
  it("lets the user jump to another month from the caption", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Calendar
        selected={selected}
        minDate={minDate}
        maxDate={maxDate}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Escolher mês" }));
    await user.click(screen.getByRole("button", { name: "Janeiro 2026" }));
    await user.click(screen.getByRole("button", { name: /^10$/ }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    const picked = onSelect.mock.calls[0][0] as Date;
    expect(picked.getFullYear()).toBe(2026);
    expect(picked.getMonth()).toBe(0);
    expect(picked.getDate()).toBe(10);
  });

  it("lets the user jump to another year from the caption", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(
      <Calendar
        selected={selected}
        minDate={minDate}
        maxDate={maxDate}
        onSelect={onSelect}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Escolher mês" }));
    await user.click(screen.getByRole("button", { name: "Escolher ano" }));
    await user.click(screen.getByRole("button", { name: "2025" }));
    await user.click(screen.getByRole("button", { name: "Junho 2025" }));
    await user.click(screen.getByRole("button", { name: /^8$/ }));

    const picked = onSelect.mock.calls[0][0] as Date;
    expect(picked.getFullYear()).toBe(2025);
    expect(picked.getMonth()).toBe(5);
    expect(picked.getDate()).toBe(8);
  });
});
