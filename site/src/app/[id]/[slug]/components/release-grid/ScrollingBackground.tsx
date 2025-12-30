"use client";

import React, { JSX, useEffect } from "react";

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

  useEffect(() => {
    setTimeout(() => {
      setTextP((t) => shuffleArray(t));
    }, 300 * speed);
  }, [speed, textP]);

  return (
    <div
      className={
        " font-mono text-black opacity-25 overflow-hidden w-full line-clamp-26  sm:line-clamp-48"
      }
      style={{
        fontSize: "0.6rem",
        textOverflow: "clip",
        textWrap: "nowrap",
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
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
