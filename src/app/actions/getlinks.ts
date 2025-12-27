"use server";

import { verifySession } from "@/lib/dal";
import { LinkResponse, serverFetch } from "@/lib/apihelper";

export async function getLinks(upc: string) {
  "use server";
  const session = await verifySession();

  if (!session) {
    return null;
  }

  const resp = await serverFetch(session.token || "", `/links/${upc}`, {});

  if (!resp.ok) {
    return null;
  }

  return (await resp.json()) as LinkResponse;
}
