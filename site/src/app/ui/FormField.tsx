import { StylingContext } from "@/app/ui/StylingProvider";
import React, { useContext } from "react";

export const FormField = ({
  name,
  label,
  value,
  button,
  type = "text",
  inactive = false,
  valueUpdater,
}: {
  name: string;
  label: string;
  value: string;
  type?: string;
  button?: React.JSX.Element;
  inactive?: boolean;
  valueUpdater?: (value: string) => void;
}) => {
  const styling = useContext(StylingContext);

  return (
    <div
      // key={uuidv4()}
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
        htmlFor={name}
      >
        {label}
      </label>
      <div className={"flex "}>
        <input
          type={type}
          id={name}
          name={name}
          value={value}
          contentEditable={!inactive}
          disabled={inactive}
          className={"flex-2  focus:outline-0 "}
          style={{
            color: inactive
              ? styling.colours.foreground + "AA"
              : styling.colours.foreground,
          }}
          onInput={(e) => valueUpdater && valueUpdater(e.currentTarget.value)}
        />
        {button}
      </div>
    </div>
  );
};
