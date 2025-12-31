import { StylingContext } from "@/app/ui/StylingProvider";
import Link from "next/link";
import React, { useContext } from "react";

export const HeaderLink = ({
  className,
  ...rest
}: React.ComponentProps<typeof Link>) => {
  const styling = useContext(StylingContext);

  return (
    <Link
      className={"mr-4  p-2 rounded-md duration-100 " + className}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = styling.colours.background;
        e.currentTarget.style.color = styling.colours.accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = styling.colours.accent;
        e.currentTarget.style.color = styling.colours.background;
      }}
      {...rest}
    ></Link>
  );
};
