"use server";

import { LoginData } from "@/app/ui/LoginForm";
import { LoginFormSchema, LoginFormState } from "@/lib/definitions";
import { createSession } from "@/lib/session";
import { apiDomain } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(loginData: LoginData): Promise<LoginFormState> {
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
