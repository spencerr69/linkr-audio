import { StylingContext } from "@/app/ui/StylingProvider";
import Link from "next/link";
import React, { useContext } from "react";

const classes = " rounded-md  border-2" + " cursor-pointer duration-100";

const getClasses = (inline: boolean, secondary: boolean) => {
  let inner_classes = inline
    ? classes + " px-4 -translate-y-2"
    : classes + " p-1 px-6";

  inner_classes = secondary ? inner_classes + " " : inner_classes + " ";
  return inner_classes;
};

interface ButtonProps extends React.ComponentProps<"button"> {
  inline?: boolean;
  secondary?: boolean;
}

interface ExternalButtonProps extends React.ComponentProps<typeof Link> {
  inline?: boolean;
  secondary?: boolean;
}

export const Button = ({
  inline,
  secondary,
  className,
  ...rest
}: ButtonProps) => {
  const styling = useContext(StylingContext);

  return (
    <button
      className={getClasses(!!inline, !!secondary) + " " + className}
      type={"button"}
      style={{
        color: !secondary ? styling.colours.background : styling.colours.accent,
        backgroundColor: !secondary
          ? styling.colours.accent
          : styling.colours.background,
        borderColor: styling.colours.accent,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = !secondary
          ? styling.colours.accent
          : styling.colours.background;
        e.currentTarget.style.backgroundColor = !secondary
          ? styling.colours.background
          : styling.colours.accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = secondary
          ? styling.colours.accent
          : styling.colours.background;
        e.currentTarget.style.backgroundColor = secondary
          ? styling.colours.background
          : styling.colours.accent;
      }}
      {...rest}
    >
      {rest.children}
    </button>
  );
};

export const ExternalButton = ({
  inline,
  secondary,
  className,
  style,
  ...rest
}: ExternalButtonProps) => {
  const classes = getClasses(!!inline, !!secondary) + " " + className;

  const styling = useContext(StylingContext);

  return (
    <Link
      className={classes}
      style={{
        color: !secondary ? styling.colours.background : styling.colours.accent,
        backgroundColor: !secondary
          ? styling.colours.accent
          : styling.colours.background,
        borderColor: styling.colours.accent,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = !secondary
          ? styling.colours.accent
          : styling.colours.background;
        e.currentTarget.style.backgroundColor = !secondary
          ? styling.colours.background
          : styling.colours.accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = secondary
          ? styling.colours.accent
          : styling.colours.background;
        e.currentTarget.style.backgroundColor = secondary
          ? styling.colours.background
          : styling.colours.accent;
      }}
      {...rest}
    />
  );
};
