import Link from "next/link";
import React from "react";

export const HeaderLink = ({
  className,
  ...rest
}: React.ComponentProps<typeof Link>) => {
  return (
    <Link
      className={
        "mr-4 hover:bg-white hover:text-rose-500 p-2 rounded-md duration-100 " +
        className
      }
      {...rest}
    ></Link>
  );
};
