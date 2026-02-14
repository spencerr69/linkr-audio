"use client";

import { StylingContext } from "@/app/ui/StylingProvider";
import React, { useContext } from "react";

interface ReleaseHeaderProps {
  title: string;
  artistName: string;
}

export const ReleaseHeader: React.FC<ReleaseHeaderProps> = ({
  title,
  artistName,
}) => {
  const styling = useContext(StylingContext);

  return (
    <div
      className={
        "titles align-middle flex flex-col justify-center border-b-2 border-dashed text-center" +
        " p-4 text-black"
      }
      style={{
        lineHeight: "1rem",
        color: styling.colours.foreground,
        borderColor: `${styling.colours.foreground}22`,
      }}
    >
      <h1 className={"text-lg font-bold"} style={{ lineHeight: "inherit" }}>
        {title}
      </h1>
      <h3
        className={"italic"}
        style={{
          lineHeight: "inherit",
        }}
      >
        {artistName}
      </h3>
    </div>
  );
};
