import { StylingContext } from "@/app/ui/StylingProvider";
import Image from "next/image";
import React, { useContext, useRef } from "react";

interface ReleaseArtworkProps {
  artwork: string | null | undefined;
  title: string;
}

export const ReleaseArtwork: React.FC<ReleaseArtworkProps> = ({
  artwork,
  title,
}) => {
  const ref = useRef<HTMLImageElement>(null);
  const vinylRef = useRef<HTMLImageElement>(null);

  const styling = useContext(StylingContext);

  return (
    <div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();

        // Calculate mouse position relative to the center of the card
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const intensity = 80;

        const rotateY = (centerY - y) / intensity;
        const rotateX = (x - centerX) / intensity;

        if (!ref.current) return;

        ref.current.style.transform = `perspective(1000px) rotateX(${rotateY}deg) rotateY(${rotateX}deg) scale3d(0.995, 0.995, 0.995)`;

        if (!vinylRef.current) return;

        vinylRef.current.style.transform = `perspective(1000px) rotateX(${rotateY}deg) rotateY(${rotateX}deg) scale3d(0.995, 0.995, 0.995) translateX(100px)`;
      }}
      onMouseLeave={() => {
        if (!ref.current) return;
        // Reset position when mouse leaves
        ref.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        if (!vinylRef.current) return;
        // Reset position when mouse leaves
        vinylRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) translateX(0)`;
      }}
      className={
        "w-full border-b-2 flex items-center justify-center p-8 border-l-2 border-dashed "
      }
      style={{
        borderColor: `${styling.colours.foreground}22`,
      }}
    >
      <Image
        ref={ref}
        src={artwork || ""}
        alt={`${title} artwork`}
        height={500}
        width={500}
        className={
          "aspect-square rounded-md w-full max-w-[500px] h-auto object-cover transition-all duration-200  ease-custom " +
          " hover:shadow-lg hover:drop-shadow-lg z-10"
        }
        draggable={false}
      />
      <Image
        src={"/vinyl.png"}
        ref={vinylRef}
        alt={"vinyl"}
        height={500}
        width={500}
        className={
          "absolute -z-10 duration-200 ease-custom drop-shadow-2xl transition-all object-cover"
        }
      />
    </div>
  );
};
