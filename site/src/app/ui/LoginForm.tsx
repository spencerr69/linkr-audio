"use client";

import { login } from "@/app/actions/auth";
import { Button } from "@/app/ui/Button";
import PopupContainer from "@/app/ui/PopupContainer";
import { LoginFormState } from "@/lib/definitions";
import posthog from "posthog-js";
import { useActionState } from "react";

export function LoginForm() {
  const [state, action, pending] = useActionState(
    async (prevState: LoginFormState, formData: FormData) => {
      const artistId = formData.get("artistid") as string;

      posthog.capture("login_submitted", {
        artist_id: artistId,
      });

      const result = await login(prevState, formData);

      // If login succeeded (no error message), identify the user
      if (!result?.message && !result?.errors) {
        posthog.identify(artistId, {
          artist_id: artistId,
        });
      }

      return result;
    },
    undefined,
  );

  return (
    <PopupContainer>
      <form
        className={
          "text-black flex flex-col items-center w-full lg:w-1/4 h-1/2 lg:h-1/4 bg-white justify-center"
        }
        action={action}
      >
        <div className={"flex flex-col"}>
          <label htmlFor="artistid">Artist ID </label>
          <input
            className={"  border-b-2 border-dashed"}
            type="text"
            name={"artistid"}
            placeholder={"Artist ID"}
          />
        </div>
        {state?.errors?.artistid && <p>{state.errors.artistid}</p>}
        <div className={"flex flex-col p-4"}>
          <label htmlFor="password">Password </label>
          <input
            className={" border-b-2 border-dashed"}
            type="password"
            name={"password"}
            placeholder={"Password"}
          />
        </div>
        {state?.errors?.password && <p>{state.errors.password}</p>}
        <Button className={"m-4"} disabled={pending} type={"submit"}>
          Log In
        </Button>
        {state?.message && <p>{state.message}</p>}
      </form>
    </PopupContainer>
  );
}
