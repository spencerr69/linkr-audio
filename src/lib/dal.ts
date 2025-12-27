import "server-only";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { cache } from "react";
import { JWTPayload } from "jose";

export type Session = {
  isAuth: boolean;
  jwt?: JWTPayload;
};

export const verifySession = cache(async (): Promise<Session> => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session) {
    return { isAuth: false };
  }

  return {
    isAuth: true,
    jwt: session,
  };
});
