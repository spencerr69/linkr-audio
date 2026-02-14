"use client";

import { StylingContext } from "@/app/ui/StylingProvider";
import React, { useContext } from "react";

interface ReleaseInfoProps {
  releaseDate: string | null | undefined;
  trackCount: number;
  upc: string | null | undefined;
}

export const ReleaseInfo: React.FC<ReleaseInfoProps> = ({
  releaseDate,
  trackCount,
  upc,
}) => {
  const styling = useContext(StylingContext);

  return (
    <div
      style={{ lineHeight: "0.9rem", color: styling.colours.foreground }}
      className={"text-black opacity-50"}
    >
      <p>
        {releaseDate}
        <br />
        {trackCount} track{trackCount > 1 ? "s" : ""}
        <br />
        {upc}
      </p>
    </div>
  );
};
