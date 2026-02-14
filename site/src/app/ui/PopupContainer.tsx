"use client";

import React from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export default function PopupContainer(props: React.PropsWithChildren<{}>) {
  return (
    <div
      className={
        "absolute w-screen h-screen bg-gray-900 flex justify-center items-center"
      }
    >
      {props.children}
    </div>
  );
}
