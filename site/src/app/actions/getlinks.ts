"use server";

import { LinkResponse, serverFetch } from "@/lib/apihelper";
import { verifySession } from "@/lib/dal";

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
