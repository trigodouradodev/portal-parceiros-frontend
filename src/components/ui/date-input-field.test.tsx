import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateInputField } from "@/components/ui/date-input-field";

function ControlledDate({ initial = "" }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <DateInputField
        label="Data de nascimento"
        value={value}
        onChange={setValue}
      />
      <output data-testid="stored-date">{value}</output>
    </>
  );
}

describe("DateInputField", () => {
  it("masks numeric typing and stores the complete date as ISO without a dialog", async () => {
    const user = userEvent.setup();
    render(<ControlledDate />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("type", "text");
    await user.type(input, "20051990");
    expect(input).toHaveValue("20/05/1990");
    expect(screen.getByTestId("stored-date")).toHaveTextContent("1990-05-20");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("supports deleting and retyping a prefilled date", async () => {
    const user = userEvent.setup();
    render(<ControlledDate initial="1990-05-20" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("20/05/1990");
    await user.click(input);
    await user.keyboard("{End}{Backspace}");
    expect(input).toHaveValue("20/05/199");
    await user.keyboard("1");
    expect(screen.getByTestId("stored-date")).toHaveTextContent("1991-05-20");
    await user.clear(input);
    expect(input).toHaveValue("");
    expect(screen.getByTestId("stored-date")).toBeEmptyDOMElement();
  });

  it("accepts pasted dates and preserves impossible dates for validation", async () => {
    const user = userEvent.setup();
    render(<ControlledDate />);
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.paste("31/02/1990");
    expect(input).toHaveValue("31/02/1990");
    expect(screen.getByTestId("stored-date")).toHaveTextContent("1990-02-31");
  });

  it("updates the displayed date when autofill changes the value", () => {
    const { rerender } = render(
      <DateInputField label="Data" value="" onChange={vi.fn()} />,
    );
    rerender(
      <DateInputField label="Data" value="1985-02-10" onChange={vi.fn()} />,
    );
    expect(screen.getByRole("textbox")).toHaveValue("10/02/1985");
  });
});
