import "server-only";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { cache } from "react";

export type Session = {
  isAuth: boolean;
  token?: string;
  artistId?: string;
};

export const verifySession = cache(async (): Promise<Session> => {
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  if (!session?.token) {
    return { isAuth: false };
  }

  return {
    isAuth: true,
    token: session.token as string,
    artistId: session.artistId as string,
  };
});
