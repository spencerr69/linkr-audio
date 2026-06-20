"use server";

import { serverFetch } from "@/lib/apihelper";
import { LinkResponse } from "@/lib/definitions";
import { getSession } from "@/lib/session";
import { JSONResult, jsonToResult, resultToJson } from "@/lib/utils";
import { Err, Ok } from "@scidsgn/std";

/**
 * Get music links given a UPC. Doesn't fucken work anymore cause like everyone changed their api auth rules...
 * @param {string} upc
 * @returns {Promise<JSONResult<LinkResponse, string>>}
 */
export async function getLinks(
  upc: string,
): Promise<JSONResult<LinkResponse, string>> {
  "use server";
  const sessionRequest = jsonToResult(await getSession());

  if (sessionRequest.isErr) {
    return resultToJson(Err.of("Not logged in."));
  }

  const session = sessionRequest.get();

  const resp = await serverFetch(session.raw_token, `/links/${upc}`, {});

  if (!resp.ok) {
    return resultToJson(Err.of(`Could not find music links for UPC: ${upc}`));
  }

  return resultToJson(Ok.of(await resp.json()));
}
