"use server";

import { serverFetch } from "@/lib/apihelper";
import { verifySession } from "@/lib/dal";
import { LinkResponse } from "@/lib/definitions";

export async function getLinks(upc: string) {
  "use server";
  const session = await verifySession();

  if (!session || !session.jwt) {
    return null;
  }

  const resp = await serverFetch(session.jwt, `/links/${upc}`, {});

  if (!resp.ok) {
    return null;
  }

  return (await resp.json()) as LinkResponse;
}
