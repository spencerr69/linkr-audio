import type { Styling, StylingGuaranteed } from "@/lib/definitions";
import { Err, Ok, type Result } from "@scidsgn/std";

export const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN;

export const apiDomain = process.env.NEXT_PUBLIC_API_ROOT_DOMAIN;

export const applyEmail = process.env.NEXT_PUBLIC_APPLY_EMAIL;

export const baseDomain = new URL(rootDomain).host;

export const stylingComp = (styling: Styling): StylingGuaranteed => {
  return {
    colours: {
      accent: styling.colours?.accent ?? "#FF066A",
      foreground: styling.colours?.foreground ?? "#000000",
      background: styling.colours?.background ?? "#F5F5F5",
    },
  };
};

export type JSONResult<T, E> =
  | { isOk: true; isErr: false; value: T }
  | { isOk: false; isErr: true; error: E };

export function resultToJson<T, E>(result: Result<T, E>): JSONResult<T, E> {
  if (result.isOk) {
    return {
      isOk: true,
      isErr: false,
      value: result.get(),
    };
  } else {
    return {
      isOk: false,
      isErr: true,
      error: result.error(),
    };
  }
}

export function jsonToResult<T, E>(json: JSONResult<T, E>): Result<T, E> {
  if (json.isOk) {
    return Ok.of(json.value);
  } else {
    return Err.of(json.error);
  }
}
