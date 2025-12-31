"use server";

import { SessionPayload } from "@/lib/definitions";
import { components } from "@/lib/schema";
import { encrypt } from "@/lib/session";
import { apiDomain } from "@/lib/utils";
import { JWTPayload } from "jose";

/**
 * Do a fetch request on the server side.
 * @param session
 * @param path Path should begin with /
 * @param fetchOptions
 */
export const serverFetch = async (
  session: JWTPayload,
  path: string,
  fetchOptions: RequestInit,
) => {
  "use server";

  const sessionPure = { artistId: session.artistId } as SessionPayload;

  const out = await encrypt(sessionPure);

  const newFetchOptions = {
    ...fetchOptions,
    headers: { ...fetchOptions.headers, Authorization: `Bearer ${out}` },
  };

  const url = apiDomain + path;

  return await fetch(url, newFetchOptions);
};

export type Release = components["schemas"]["Release"];
export type Link = components["schemas"]["Link"];
export type LinkResponse = components["schemas"]["LinkResponse"];
export type ArtistResponse = components["schemas"]["Artist"];
export type EditArtist = {
  master_artist_name: string;
  links: components["schemas"]["Link"][];
  styling?: Styling;
};
export type Styling = components["schemas"]["Styling"];
