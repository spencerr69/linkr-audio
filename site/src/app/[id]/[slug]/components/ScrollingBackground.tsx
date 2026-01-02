"use client";

import { StylingContext } from "@/app/ui/StylingProvider";
import React, { JSX, useContext, useEffect } from "react";

interface ScrollingBackgroundProps {
  text: string;
  rows?: number;
  speed?: number;
}

export const ScrollingBackground: React.FC<ScrollingBackgroundProps> = ({
  text,
  rows = 8,
  speed = 1,
}) => {
  const initText = [];
  for (let i = 0; i < rows; i += 1) {
    initText.push(<p key={i}>{text.repeat(100).slice(i)}</p>);
  }

  const [textP, setTextP] = React.useState<JSX.Element[]>(initText);

  const styling = useContext(StylingContext);

  useEffect(() => {
    setTimeout(() => {
      setTextP((t) => shuffleArray(t));
    }, 300 * speed);
  }, [speed, textP]);

  return (
    <div
      className={
        " font-mono  opacity-25 overflow-hidden w-full line-clamp-26  sm:line-clamp-48"
      }
      style={{
        fontSize: "0.6rem",
        textOverflow: "clip",
        textWrap: "nowrap",
        color: styling.colours.foreground,
      }}
    >
      {textP}
    </div>
  );
};

function shuffleArray<T>(array: T[]) {
  const out: T[] = array.slice();
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // @ts-expect-error this is gonna work dw
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
