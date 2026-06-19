import { Button } from "@/app/ui/Button";
import { FormField } from "@/app/ui/FormField";
import { StylingContext } from "@/app/ui/StylingProvider";
import { useContext } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import {
  ArrayPath,
  Control,
  FieldValues,
  useFieldArray,
  UseFormRegister,
} from "react-hook-form";

export type FormLinksProps<FormType extends FieldValues> = {
  control: Control<FormType>;
  name: ArrayPath<FormType>;
  register: UseFormRegister<FormType>;
};
export function FormLinks<FormType extends FieldValues>({
  control,
  name,
  register,
}: FormLinksProps<FormType>) {
  const styling = useContext(StylingContext);

  const { fields, append, remove, swap } = useFieldArray({
    control,
    name,
  });

  const linkFields = fields.map((field, i) => {
    return (
      <div
        key={field.id}
        className={"flex flex-col m-2  p-2 rounded-lg"}
        style={{ backgroundColor: styling.colours.background }}
      >
        <FormField
          title={"Name"}
          register={register}
          // @ts-expect-error This is a Link type.
          label={`${name}.${i}.name` as const}
          button={
            <>
              {i > 0 && (
                <Button
                  inline
                  secondary
                  squish
                  onClick={() => {
                    swap(i, i - 1);
                  }}
                >
                  <KeyboardArrowUp />
                </Button>
              )}
              {i < fields.length - 1 && (
                <Button
                  inline
                  secondary
                  squish
                  onClick={() => {
                    swap(i, i + 1);
                  }}
                >
                  <KeyboardArrowDown />
                </Button>
              )}
              <Button
                className={""}
                inline
                secondary
                squish
                onClick={() => remove(i)}
              >
                <RemoveIcon />
              </Button>
            </>
          }
        />
        <FormField
          title={"URL"}
          // @ts-expect-error This is a Link type
          label={`${name}.${i}.url` as const}
          register={register}
        />
      </div>
    );
  });

  return (
    <div className={""}>
      <label
        htmlFor="links"
        className={" font-light text-sm p-0 m-0"}
        style={{ color: styling.colours.foreground + "AA" }}
      >
        Links
      </label>
      <div
        id="links"
        className={" p-1 h-full rounded-md"}
        style={{
          backgroundColor: styling.colours.foreground + "11",
        }}
      >
        {linkFields}
        <div className={"flex justify-center mt-4"}>
          <Button
            className={"mb-4"}
            squish
            onClick={() => {
              // @ts-expect-error No way to say this is specifically a Link type
              append({ name: "", url: "" });
            }}
          >
            <AddIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
