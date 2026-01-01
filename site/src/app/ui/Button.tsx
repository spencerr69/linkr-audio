"use client";

import { StylingContext } from "@/app/ui/StylingProvider";
import Link from "next/link";
import React, { useContext } from "react";

const classes = " rounded-md " + " cursor-pointer duration-100 p-0.5 ";

const getClasses = (
  inline: boolean,
  secondary: boolean,
  squish: boolean,
  fill: boolean,
) => {
  let inner_classes = inline
    ? classes + "  -translate-y-2"
    : classes + "  border-2";

  inner_classes = secondary ? inner_classes + " " : inner_classes + " ";

  inner_classes = squish ? inner_classes + " " : inner_classes + " w-30 px-3";

  inner_classes = fill ? inner_classes + " w-full" : inner_classes + " ";

  return inner_classes;
};

interface ButtonProps extends React.ComponentProps<"button"> {
  inline?: boolean;
  secondary?: boolean;
  squish?: boolean;
  fill?: boolean;
}

interface ExternalButtonProps extends React.ComponentProps<typeof Link> {
  inline?: boolean;
  secondary?: boolean;
  squish?: boolean;
  fill?: boolean;
}

export const Button = ({
  inline,
  secondary,
  squish,
  fill,
  className,
  style,
  ...rest
}: ButtonProps) => {
  const styling = useContext(StylingContext);

  return (
    <button
      className={
        getClasses(!!inline, !!secondary, !!squish, !!fill) + " " + className
      }
      type={"button"}
      style={{
        color: !secondary ? styling.colours.background : styling.colours.accent,
        backgroundColor: inline
          ? "transparent"
          : !secondary
            ? styling.colours.accent
            : styling.colours.background,
        borderColor: styling.colours.accent,
        ...style,
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
        e.currentTarget.style.backgroundColor = inline
          ? "transparent"
          : secondary
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
  squish,
  fill,
  className,
  style,
  ...rest
}: ExternalButtonProps) => {
  const classes =
    getClasses(!!inline, !!secondary, !!squish, !!fill) + " " + className;

  const styling = useContext(StylingContext);

  return (
    <Link
      className={classes}
      style={{
        color: !secondary ? styling.colours.background : styling.colours.accent,
        backgroundColor: inline
          ? "transparent"
          : !secondary
            ? styling.colours.accent
            : styling.colours.background,
        borderColor: styling.colours.accent,
        ...style,
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
        e.currentTarget.style.backgroundColor = inline
          ? "transparent"
          : secondary
            ? styling.colours.background
            : styling.colours.accent;
      }}
      {...rest}
    />
  );
};
