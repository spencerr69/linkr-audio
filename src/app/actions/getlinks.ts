"use server";

import { verifySession } from "@/lib/dal";
import { serverFetch } from "@/lib/apihelper";

export async function getLinks(upc: string) {
  "use server";
  const session = await verifySession();

  if (!session) {
    return [];
  }

  const resp = await serverFetch(session.token || "", `/links/${upc}`, {});

  if (!resp.ok) {
    return [];
  }

  return await resp.json();
}
