"use server";

import { apiDomain } from "@/lib/utils";

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

  const newHeaders = new Headers(fetchOptions.headers);
  newHeaders.set("Authorization", `Bearer ${token}`);

  const newFetchOptions = {
    ...fetchOptions,
    headers: newHeaders,
  };

  const url = apiDomain + path;

  return await fetch(url, newFetchOptions);
};
