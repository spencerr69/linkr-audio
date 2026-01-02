import { Styling, StylingGuaranteed } from "@/lib/definitions";

export const rootDomain =
  process.env.PUBLIC_ROOT_DOMAIN || "http://localhost:3000";

export const apiDomain = process.env.API_ROOT_DOMAIN || "http://localhost:8787";

export const applyEmail = process.env.PUBLIC_APPLY_EMAIL || "apply@linkr.audio";

export const baseDomain = rootDomain.split("//")[1];

export const stylingComp = (styling: Styling): StylingGuaranteed => {
  return {
    colours: {
      accent: styling.colours?.accent || "#FF066A",
      foreground: styling.colours?.foreground || "#000000",
      background: styling.colours?.background || "#F5F5F5",
    },
  } as StylingGuaranteed;
};
