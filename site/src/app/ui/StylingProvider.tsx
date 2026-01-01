"use client";

import { StylingGuaranteed } from "@/lib/definitions";
import { stylingComp } from "@/lib/utils";
import React, { createContext } from "react";

export const StylingContext = createContext<StylingGuaranteed>(stylingComp({}));

export default function StylingProvider({
  styling,
  children,
}: {
  styling: StylingGuaranteed;
  children: React.ReactNode;
}) {
  return (
    <StylingContext.Provider value={styling}>
      {children}
    </StylingContext.Provider>
  );
}
