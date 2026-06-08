"use server";

import { ChangePasswordData } from "@/app/ui/Dialogs/ChangePasswordDialog";
import { LoginData } from "@/app/ui/Dialogs/LoginDialog";
import { serverFetch } from "@/lib/apihelper";
import { verifySession } from "@/lib/dal";
import { LoginFormSchema } from "@/lib/definitions";
import { authenticateUser, createSession } from "@/lib/session";
import { apiDomain, JSONResult, jsonToResult, resultToJson } from "@/lib/utils";
import { Err, Ok } from "@scidsgn/std";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Login. Stores token in cookies if successful.
 * @param {LoginData} loginData
 * @returns {Promise<JSONResult<boolean, string>>}
 */
export async function login(
  loginData: LoginData,
): Promise<JSONResult<boolean, string>> {
  "use server";
  const validatedFields = LoginFormSchema.safeParse({
    artistid: loginData.artist_id,
    password: loginData.password,
  });

  if (!validatedFields.success) {
    return resultToJson(Err.of(validatedFields.error.message));
  }

  const token = await authenticateUser(
    validatedFields.data.artistid,
    validatedFields.data.password,
  );

  if (!token) {
    return resultToJson(Err.of("Incorrect login details."));
  }

  await createSession(token);
  return resultToJson(Ok.of(true));
}

/**
 * Logout. Cannot fail.
 * @returns {Promise<void>}
 */
export async function logout(): Promise<void> {
  "use server";
  const cookie = await cookies();
  cookie.delete("session");
  redirect("/");
}

export async function changePassword(
  changePasswordData: ChangePasswordData,
): Promise<JSONResult<boolean, string>> {
  const sessionRequest = jsonToResult(await verifySession());

  if (sessionRequest.isErr) {
    await logout();
    return resultToJson(sessionRequest);
  }

  const session = sessionRequest.get();

  const artistId = session.jwt?.artistId;

  const token = btoa(`${artistId}:${changePasswordData.currentPassword}`);

  const data = await fetch(`${apiDomain}/auth/login`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${token}`,
    },
  });

  if (!data.ok) {
    return resultToJson(Err.of("Incorrect current password."));
  }

  const changePasswordRequest = await serverFetch(
    session.raw_token,
    `/artists/${artistId}/password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        new_password: changePasswordData.newPassword,
      }),
    },
  );

  if (!changePasswordRequest.ok) {
    return resultToJson(Err.of("Failed to update password."));
  }

  return resultToJson(Ok.of(true));
}
