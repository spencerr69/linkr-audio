"use server";

import { serverFetch } from "@/lib/apihelper";
import { verifySession } from "@/lib/dal";
import { LinkResponse } from "@/lib/definitions";
import { Err, Ok, Result } from "@scidsgn/std";

/**
 * Get music links given a UPC. Doesn't fucken work anymore cause like everyone changed their api auth rules...
 * @param {string} upc
 * @returns {Promise<Result<LinkResponse, string>>}
 */
export async function getLinks(
  upc: string,
): Promise<Result<LinkResponse, string>> {
  "use server";
  const sessionRequest = await verifySession();

  if (sessionRequest.isErr) {
    return Err.of("Not logged in.");
  }

  const session = sessionRequest.get();

  const resp = await serverFetch(session.raw_token, `/links/${upc}`, {});

  if (!resp.ok) {
    return Err.of(`Could not find music links for UPC: ${upc}`);
  }

  return Ok.of(await resp.json());
}
