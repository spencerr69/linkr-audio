"use server";

import { apiDomain } from "@/lib/utils";
import { components } from "@/lib/schema";

/**
 * Do a fetch request on the server side.
 * @param token
 * @param path Path should begin with /
 * @param fetchOptions
 */
export const serverFetch = async (
  token: string,
  path: string,
  fetchOptions: RequestInit,
) => {
  "use server";

  const newFetchOptions = {
    ...fetchOptions,
    headers: { ...fetchOptions.headers, Authorization: `Basic ${token}` },
  };

  const url = apiDomain + path;

  return await fetch(url, newFetchOptions);
};

export type ArtistResponse = {
  master_artist_name: string;
  artist_id: string;
  styling: null | string;
};

export type Release = components["schemas"]["Release"];
