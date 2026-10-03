"use server";

import "server-only";
import { apiDomain, type JSONResult, resultToJson } from "@/lib/utils";
import { Err, Ok } from "@scidsgn/std";
import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type Session = {
  artistId: string;
  raw_token: string;
};

const decode = async (session: string | undefined = "") => {
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
    sameSite: "strict",
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

  const session = await decode(cookie).catch(() => {
    return null;
  });

  if (!session) {
    return resultToJson(Err.of("Couldn't get session"));
  }

  if (!session.artistId || typeof session.artistId !== "string")
    return resultToJson(Err.of("Invalid session"));

  return resultToJson(
    Ok.of({
      artistId: session.artistId,
      raw_token: cookie,
    }),
  );
};
