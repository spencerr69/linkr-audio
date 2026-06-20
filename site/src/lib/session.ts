"use server";

import "server-only";
import { apiDomain, JSONResult, resultToJson } from "@/lib/utils";
import { Err, Ok } from "@scidsgn/std";
import { decodeJwt, JWTPayload } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Session = {
  jwt: JWTPayload;
  raw_token: string;
};
export const decrypt = async (session: string | undefined = "") => {
  return decodeJwt(session);
};

export const authenticateUser = async (id: string, password: string) => {
  const authRequest = await fetch(`${apiDomain}/auth?id=${id}&pw=${password}`, {
    method: "POST",
  });

  if (!authRequest.ok) {
    return null;
  }

  const { token }: { token: string } = await authRequest.json();

  return token;
};

export const createSession = async (session: string) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });

  redirect("/admin");
};

/**
 * Get the current session token. This will only check if the token is decodable, not if it is encrypted
 * correctly. That is handled in api.
 * @returns {Promise<JSONResult<Session, string>>}
 */
export const getSession = async (): Promise<JSONResult<Session, string>> => {
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
