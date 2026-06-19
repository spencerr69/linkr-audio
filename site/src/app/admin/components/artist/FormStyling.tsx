import { ColourPicker } from "@/app/ui/ColourPicker";
import { FormField } from "@/app/ui/FormField";
import {
  FieldValues,
  Path,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";

interface FormStylingProps<FormType extends FieldValues> {
  topLabel: Path<FormType>;
  register: UseFormRegister<FormType>;
  getValues: UseFormGetValues<FormType>;
  setValue: UseFormSetValue<FormType>;
}
export function FormStyling<FormType extends FieldValues>({
  register,
  topLabel,
  getValues,
  setValue,
}: FormStylingProps<FormType>) {
  const updater = (path: string) => {
    return (value: string) => {
      // @ts-expect-error Can't really type this shit
      setValue(path, value);
    };
  };

  return (
    <div className={"grid lg:grid-cols-3 gap-4 w-full"}>
      <FormField
        title={"Accent Colour"}
        register={register}
        // @ts-expect-error can't really type it
        label={`${topLabel}.colours.accent` as const}
        button={
          <ColourPicker
            // @ts-expect-error can't really type it
            value={getValues(`${topLabel}.colours.accent`) || ""}
            valueUpdaterAction={updater(`${topLabel}.colours.accent`)}
          />
        }
      />
      <FormField
        title={"Foreground Colour"}
        register={register}
        // @ts-expect-error can't really type it
        label={`${topLabel}.colours.foreground` as const}
        button={
          <ColourPicker
            // @ts-expect-error can't really type it
            value={getValues(`${topLabel}.colours.foreground`) || ""}
            valueUpdaterAction={updater(`${topLabel}.colours.foreground`)}
          />
        }
      />
      <FormField
        title={"Background Colour"}
        register={register}
        // @ts-expect-error can't really type it
        label={`${topLabel}.colours.background` as const}
        button={
          <ColourPicker
            // @ts-expect-error can't really type it
            value={getValues(`${topLabel}.colours.background`) || ""}
            valueUpdaterAction={updater(`${topLabel}.colours.background`)}
          />
        }
      />
    </div>
  );
}
