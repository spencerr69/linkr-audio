"use server";

import "server-only";
import { decrypt } from "@/lib/session";
import { JSONResult, resultToJson } from "@/lib/utils";
import { Err, Ok } from "@scidsgn/std";
import { JWTPayload } from "jose";
import { cookies } from "next/headers";

export type Session = {
  jwt: JWTPayload;
  raw_token: string;
};

/**
 * Verify if current user is logged in. This will only check if the token is decodable, not if it is encrypted
 * correctly. That is handled in api.
 * @returns {Promise<JSONResult<Session, string>>}
 */
export const verifySession = async (): Promise<JSONResult<Session, string>> => {
  "use server";
  const cookie = (await cookies()).get("session")?.value;

  if (!cookie) {
    return resultToJson(Err.of("No login cookie found."));
  }

  const session = await decrypt(cookie);

  if (!session) {
    return resultToJson(Err.of("Couldn't decrypt cookie."));
  }

  return resultToJson(
    Ok.of({
      jwt: session,
      raw_token: cookie,
    }),
  );
};
