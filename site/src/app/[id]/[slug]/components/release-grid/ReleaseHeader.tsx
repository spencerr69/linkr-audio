import React from "react";

interface ReleaseHeaderProps {
  title: string;
  artistName: string;
}

export const ReleaseHeader: React.FC<ReleaseHeaderProps> = ({
  title,
  artistName,
}) => {
  return (
    <div
      className={
        "titles align-middle flex flex-col justify-center border-b-2 border-gray-300 border-dashed text-center" +
        " p-4 text-black"
      }
      style={{ lineHeight: "1rem" }}
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
