import "server-only";
import { apiDomain } from "@/lib/utils";
import { decodeJwt } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const decrypt = async (session: string | undefined = "") => {
  try {
    return decodeJwt(session);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return null;
  }
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
