import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { FormDateInput } from "@/components/ui/rhf-fields";
import {
  birthDateSchema,
  CLIENT_BIRTH_DATE_MESSAGE,
  INVALID_BIRTH_DATE_MESSAGE,
} from "@/features/originacao/schemas/birth-date";

const dateSchema = birthDateSchema(CLIENT_BIRTH_DATE_MESSAGE);

function DateForm({ withResolver }: { withResolver: boolean }) {
  const form = useForm<{ birthDate: string }>({
    defaultValues: { birthDate: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: withResolver
      ? zodResolver(z.object({ birthDate: dateSchema }))
      : undefined,
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(vi.fn())}>
        <FormDateInput<{ birthDate: string }>
          name="birthDate"
          label="Data de nascimento"
          validationSchema={dateSchema}
        />
        <button type="submit">Enviar</button>
      </form>
    </Form>
  );
}

describe.each([true, false])("FormDateInput (resolver: %s)", (withResolver) => {
  it("waits for eight digits, rejects impossible dates before submit and clears the error on correction", async () => {
    const user = userEvent.setup();
    render(<DateForm withResolver={withResolver} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "3102199");
    expect(
      screen.queryByText(INVALID_BIRTH_DATE_MESSAGE),
    ).not.toBeInTheDocument();
    await user.type(input, "0");
    expect(screen.getByText(INVALID_BIRTH_DATE_MESSAGE)).toBeInTheDocument();
    await user.clear(input);
    await user.type(input, "28021990");
    expect(
      screen.queryByText(INVALID_BIRTH_DATE_MESSAGE),
    ).not.toBeInTheDocument();
    expect(input).not.toHaveAttribute("aria-invalid", "true");
  });

  it("keeps the age validation when typing a complete date", async () => {
    const user = userEvent.setup();
    render(<DateForm withResolver={withResolver} />);
    await user.type(screen.getByRole("textbox"), "01012020");
    expect(screen.getByText(CLIENT_BIRTH_DATE_MESSAGE)).toBeInTheDocument();
  });
});
