import { FormField } from "@/components/ui/form";
import { ChipField } from "@/components/ui/chip-field";
import { DateFilterField } from "@/components/ui/date-filter-field";
import { DateInputField } from "@/components/ui/date-input-field";
import { FileUploadField } from "@/components/ui/file-upload-field";
import { InputField } from "@/components/ui/input-field";
import { SelectDialogField } from "@/components/ui/select-dialog-field";
import { TextareaField } from "@/components/ui/textarea-field";
import { YesNoField } from "@/components/ui/yes-no-field";
import {
  useFormContext,
  type FieldPath,
  type FieldValues,
  type UseFormClearErrors,
  type UseFormSetError,
} from "react-hook-form";
import type { ComponentProps } from "react";
import type { z } from "zod";

type BoundName<T extends FieldValues> = { name: FieldPath<T> };

function handleBoundDateChange<T extends FieldValues>({
  name,
  fieldOnChange,
  validationSchema,
  hasError,
  setError,
  clearErrors,
}: {
  name: FieldPath<T>;
  fieldOnChange: (value: string) => void;
  validationSchema: z.ZodType<string>;
  hasError: boolean;
  setError: UseFormSetError<T>;
  clearErrors: UseFormClearErrors<T>;
}) {
  return (value: string) => {
    fieldOnChange(value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) && !hasError) return;

    const result = validationSchema.safeParse(value);
    if (result.success) {
      clearErrors(name);
    } else {
      setError(name, {
        type: "manual",
        message: result.error.issues[0]?.message,
      });
    }
  };
}

function handleBoundInputChange(
  fieldOnChange: (value: string) => void,
  transform?: (value: string) => string,
  onValueChange?: (value: string) => void,
) {
  return (value: string) => {
    const next = transform ? transform(value) : value;
    fieldOnChange(next);
    onValueChange?.(next);
  };
}

function handleBoundSelectChange(
  fieldOnChange: (value: string) => void,
  onValueChange?: (value: string) => void,
) {
  return (value: string) => {
    fieldOnChange(value);
    onValueChange?.(value);
  };
}

export function FormInput<T extends FieldValues>({
  name,
  transform,
  onValueChange,
  ...props
}: Omit<
  ComponentProps<typeof InputField>,
  "value" | "onChange" | "error" | "name"
> &
  BoundName<T> & {
    transform?: (value: string) => string;
    onValueChange?: (value: string) => void;
  }) {
  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <InputField
          {...props}
          name={field.name}
          value={field.value ?? ""}
          onChange={handleBoundInputChange(
            field.onChange,
            transform,
            onValueChange,
          )}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

export function FormSelect<T extends FieldValues>({
  name,
  onValueChange,
  ...props
}: Omit<
  ComponentProps<typeof SelectDialogField>,
  "value" | "onChange" | "error" | "name"
> &
  BoundName<T> & {
    onValueChange?: (value: string) => void;
  }) {
  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <SelectDialogField
          {...props}
          name={field.name}
          value={field.value ?? ""}
          onChange={handleBoundSelectChange(field.onChange, onValueChange)}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

export function FormDateInput<T extends FieldValues>({
  name,
  validationSchema,
  ...props
}: Omit<
  ComponentProps<typeof DateInputField>,
  "value" | "onChange" | "error" | "name"
> &
  BoundName<T> & { validationSchema: z.ZodType<string> }) {
  const { control, setError, clearErrors } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <DateInputField
          {...props}
          name={field.name}
          value={field.value ?? ""}
          onChange={handleBoundDateChange({
            name,
            fieldOnChange: field.onChange,
            validationSchema,
            hasError: Boolean(fieldState.error),
            setError,
            clearErrors,
          })}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

export function FormDate<T extends FieldValues>({
  name,
  ...props
}: Omit<
  ComponentProps<typeof DateFilterField>,
  "value" | "onChange" | "error" | "name"
> &
  BoundName<T>) {
  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <DateFilterField
          {...props}
          name={field.name}
          value={field.value ?? ""}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

export function FormYesNo<T extends FieldValues>({
  name,
  onChange,
  ...props
}: Omit<
  ComponentProps<typeof YesNoField>,
  "value" | "onChange" | "error" | "name"
> &
  BoundName<T> & {
    onChange?: (value: boolean) => void;
  }) {
  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <YesNoField
          {...props}
          name={field.name}
          value={field.value}
          onChange={(value) => {
            field.onChange(value);
            onChange?.(value);
          }}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

export function FormTextarea<T extends FieldValues>({
  name,
  ...props
}: Omit<
  ComponentProps<typeof TextareaField>,
  "value" | "onChange" | "error" | "name"
> &
  BoundName<T>) {
  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextareaField
          {...props}
          name={field.name}
          value={field.value ?? ""}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

export function FormChips<T extends FieldValues>({
  name,
  ...props
}: Omit<
  ComponentProps<typeof ChipField>,
  "value" | "onChange" | "error" | "name" | "multiple"
> &
  BoundName<T> & { multiple: true }) {
  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <ChipField
          {...props}
          multiple
          name={field.name}
          value={field.value ?? []}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

export function FormUpload<T extends FieldValues>({
  name,
  ...props
}: Omit<
  ComponentProps<typeof FileUploadField>,
  "value" | "onChange" | "error" | "name"
> &
  BoundName<T>) {
  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FileUploadField
          {...props}
          name={field.name}
          value={field.value ?? []}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}
