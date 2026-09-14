import { FormField } from "@/components/ui/form";
import { ChipField } from "@/components/ui/chip-field";
import { DateFilterField } from "@/components/ui/date-filter-field";
import { FileUploadField } from "@/components/ui/file-upload-field";
import { InputField } from "@/components/ui/input-field";
import { SelectDialogField } from "@/components/ui/select-dialog-field";
import { TextareaField } from "@/components/ui/textarea-field";
import { YesNoField } from "@/components/ui/yes-no-field";
import {
  useFormContext,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import type { ComponentProps } from "react";

type BoundName<T extends FieldValues> = { name: FieldPath<T> };

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
          onChange={(value) => {
            const next = transform ? transform(value) : value;
            field.onChange(next);
            onValueChange?.(next);
          }}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

export function FormSelect<T extends FieldValues>({
  name,
  ...props
}: Omit<
  ComponentProps<typeof SelectDialogField>,
  "value" | "onChange" | "error" | "name"
> &
  BoundName<T>) {
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
          onChange={field.onChange}
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
