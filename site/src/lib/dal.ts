"use server";

import "server-only";
import { decrypt } from "@/lib/session";
import { Err, Ok, Result } from "@scidsgn/std";
import { JWTPayload } from "jose";
import { cookies } from "next/headers";

export type Session = {
  jwt: JWTPayload;
  raw_token: string;
};

/**
 * Verify if current user is logged in. This will only check if the token is decodable, not if it is encrypted
 * correctly. That is handled in api.
 * @returns {Promise<Result<Session, string>>}
 */
export const verifySession = async (): Promise<Result<Session, string>> => {
  "use server";
  const cookie = (await cookies()).get("session")?.value;

  if (!cookie) {
    return Err.of("No login cookie found.");
  }

  const session = await decrypt(cookie);

  if (!session) {
    return Err.of("Couldn't decrypt cookie.");
  }

  return Ok.of({
    jwt: session,
    raw_token: cookie,
  });
};
