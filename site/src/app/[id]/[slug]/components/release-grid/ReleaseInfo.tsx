import React from "react";

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
  return (
    <div style={{ lineHeight: "0.9rem" }} className={"text-black opacity-50"}>
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
