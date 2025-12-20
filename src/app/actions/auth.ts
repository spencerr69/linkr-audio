"use server";

import { LoginFormSchema, LoginFormState } from "@/lib/definitions";
import { apiDomain } from "@/lib/utils";
import { createSession } from "@/lib/session";

export async function login(state: LoginFormState, formData: FormData) {
  "use server";
  const validatedFields = LoginFormSchema.safeParse({
    artistid: formData.get("artistid"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const token = btoa(
    `${validatedFields.data.artistid}:${validatedFields.data.password}`,
  );

  console.log(token);

  const data = await fetch(`${apiDomain}/auth/login`, {
    method: "GET",
    headers: {
      Authorization: `Basic ${token}`,
    },
  });

  if (!data.ok) {
    return {
      message: "Incorrect login details.",
    };
  }

  await createSession(token, validatedFields.data.artistid);
}
