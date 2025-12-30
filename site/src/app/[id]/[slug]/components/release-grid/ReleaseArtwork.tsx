import Image from "next/image";
import React from "react";

interface ReleaseArtworkProps {
  artwork: string | null | undefined;
  title: string;
}

export const ReleaseArtwork: React.FC<ReleaseArtworkProps> = ({
  artwork,
  title,
}) => {
  return (
    <div
      className={
        "w-full border-b-2 flex items-center justify-center p-8 border-l-2 border-dashed border-gray-300"
      }
    >
      <Image
        src={artwork || ""}
        alt={`${title} artwork`}
        height={500}
        width={500}
        className={
          "aspect-square rounded-md w-full max-w-[500px] h-auto object-cover"
        }
        draggable={false}
      />
    </div>
  );
};
