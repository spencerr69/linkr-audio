"use client";

import { StylingContext } from "@/app/ui/StylingProvider";
import Image from "next/image";
import React, { useContext, useRef } from "react";

interface ReleaseArtworkProps {
  artwork: string | null | undefined;
  title: string;
  small: boolean;
}

export const ReleaseArtwork: React.FC<ReleaseArtworkProps> = ({
  artwork,
  title,
  small,
}) => {
  const ref = useRef<HTMLImageElement>(null);
  const discRef = useRef<HTMLImageElement>(null);

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

        const intensity = small ? 30 : 60;

        const rotateY = (centerY - y) / intensity;
        const rotateX = (x - centerX) / intensity;

        if (!ref.current) return;

        ref.current.style.transform = `perspective(1000px) rotateX(${rotateY}deg) rotateY(${rotateX}deg) scale3d(0.995, 0.995, 0.995)`;

        if (!discRef.current) return;

        discRef.current.style.transform = `perspective(1000px) rotateX(${rotateY}deg) rotateY(${rotateX}deg) scale3d(0.995, 0.995, 0.995) translateX(80px)`;
      }}
      onMouseLeave={() => {
        if (!ref.current) return;
        // Reset position when mouse leaves
        ref.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        if (!discRef.current) return;
        // Reset position when mouse leaves
        discRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1) `;
      }}
      className={`relative w-full ${small || "border-b-2 border-l-2"} flex items-center justify-center p-8 border-dashed `}
      style={{
        borderColor: `${styling.colours.foreground}22`,
      }}
    >
      <Image
        ref={ref}
        suppressHydrationWarning={true}
        src={artwork || ""}
        alt={`${title} artwork`}
        height={500}
        width={500}
        loading={"eager"}
        className={
          `aspect-square rounded-md w-full max-w-[${small ? "250px" : "500px"}] h-auto object-cover transition-all duration-400` +
          "  ease-custom " +
          " hover:shadow-lg hover:drop-shadow-lg shadow-black/20 drop-shadow-black/20 z-10"
        }
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        draggable={false}
        preload
      />
      {!small && (
        <div
          className={"absolute -z-10 duration-200 transition-all ease-custom"}
          ref={discRef}
        >
          <Image
            suppressHydrationWarning={true}
            src={"/disc.png"}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            // ref={discRef}
            alt={"Disc"}
            loading={"eager"}
            // fill
            height={500}
            width={500}
            className={
              `aspect-square rounded-md  w-[500px] h-auto ` +
              " drop-shadow-2xl animate-continuous-spin "
            }
            draggable={false}
          />
        </div>
      )}
    </div>
  );
};
