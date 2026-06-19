import { StylingContext } from "@/app/ui/StylingProvider";
import React, { HTMLInputTypeAttribute, useContext } from "react";
import { FieldValues, Path, UseFormRegister } from "react-hook-form";

type FormFieldProps<FormType extends FieldValues> = {
  title: string;
  label: Path<FormType>;
  register: UseFormRegister<FormType>;
  required?: boolean;
  type?: HTMLInputTypeAttribute;
  button?: React.JSX.Element;
  inactive?: boolean;
};

export function FormField<FormType extends FieldValues>({
  title,
  label,
  register,
  required,
  type,
  button,
  inactive,
}: FormFieldProps<FormType>) {
  const styling = useContext(StylingContext);

  return (
    <div
      className={
        "p-1 flex flex-col w-full pb-0 mb-2 border-dashed text-left" +
        (inactive ? " rounded-md" : " border-b")
      }
      style={{
        backgroundColor: inactive
          ? styling.colours.foreground + "11"
          : "transparent",
        borderColor: styling.colours.foreground + "AA",
      }}
    >
      <label
        className={" font-light text-sm p-0 m-0"}
        style={{ color: styling.colours.foreground + "AA" }}
        htmlFor={label}
      >
        {title}
      </label>
      <div className={"flex "}>
        <input
          type={type}
          id={label}
          contentEditable={!inactive}
          disabled={inactive}
          className={"flex-2  focus:outline-0 "}
          style={{
            color: inactive
              ? styling.colours.foreground + "AA"
              : styling.colours.foreground,
          }}
          {...register(label, {
            required: required ?? false,
            valueAsNumber: type === "number",
          })}
        />
        {button}
      </div>
    </div>
  );
}
