"use server";

import { ChangePasswordData } from "@/app/ui/ChangePasswordModal";
import { LoginData } from "@/app/ui/LoginForm";
import { serverFetch } from "@/lib/apihelper";
import { verifySession } from "@/lib/dal";
import { LoginFormSchema } from "@/lib/definitions";
import { createSession } from "@/lib/session";
import { apiDomain } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(loginData: LoginData) {
  "use server";
  const validatedFields = LoginFormSchema.safeParse({
    artistid: loginData.artist_id,
    password: loginData.password,
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.message,
    };
  }

  const token = btoa(
    `${validatedFields.data.artistid}:${validatedFields.data.password}`,
  );

  const data = await fetch(`${apiDomain}/auth/login`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${token}`,
    },
  });

  if (!data.ok) {
    return {
      error: "Incorrect login details.",
    };
  }

  await createSession(validatedFields.data.artistid);
  return { success: true };
}

export async function logout() {
  const cookie = await cookies();
  cookie.delete("session");
  redirect("/");
}

export async function changePassword(changePasswordData: ChangePasswordData) {
  const session = await verifySession();

  if (!session.isAuth || !session.jwt) {
    await logout();
    return { success: false, message: "You are not logged in." };
  }

  const artistId = session.jwt?.artistId;

  const token = btoa(`${artistId}:${changePasswordData.currentPassword}`);

  const data = await fetch(`${apiDomain}/auth/login`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${token}`,
    },
  });

  if (!data.ok) {
    return { success: false, message: "Incorrect current password." };
  }

  await serverFetch(session.jwt, `/artists/${artistId}/password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      new_password: changePasswordData.newPassword,
    }),
  });

  return { success: true, message: "Password changed successfully." };
}
