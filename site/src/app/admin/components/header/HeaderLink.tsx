import { StylingContext } from "@/app/ui/StylingProvider";
import Link from "next/link";
import React, { useContext } from "react";

type HeaderLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

export const HeaderLink = ({
  className,
  href,
  active = false,
  children,
  onClick = () => {},
}: HeaderLinkProps) => {
  const styling = useContext(StylingContext);

  return (
    <Link
      className={"mr-3 p-1  rounded-sm duration-100 " + className}
      style={{
        backgroundColor: active
          ? styling.colours.background + "AA"
          : "transparent",
        color: active ? styling.colours.accent : styling.colours.background,
      }}
      href={href}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = styling.colours.background;
        e.currentTarget.style.color = styling.colours.accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = active
          ? styling.colours.background + "AA"
          : "transparent";
        e.currentTarget.style.color = active
          ? styling.colours.accent
          : styling.colours.background;
      }}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};
