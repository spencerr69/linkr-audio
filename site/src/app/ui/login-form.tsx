"use client";

import { login } from "@/app/actions/auth";
import PopupContainer from "@/app/ui/popup-container";
import { useActionState } from "react";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <PopupContainer>
      <form
        className={"text-black flex flex-col items-end w-1/4 h-1/4 bg-white"}
        action={action}
      >
        <div>
          <label htmlFor="artistid">Artist ID </label>
          <input
            className={" rounded-md"}
            type="text"
            name={"artistid"}
            placeholder={"Artist ID"}
          />
        </div>
        {state?.errors?.artistid && <p>{state.errors.artistid}</p>}
        <div>
          <label htmlFor="password">Password </label>
          <input
            className={" rounded-md"}
            type="password"
            name={"password"}
            placeholder={"Password"}
          />
        </div>
        {state?.errors?.password && <p>{state.errors.password}</p>}
        <button className={""} disabled={pending} type={"submit"}>
          Log In
        </button>
        {state?.message && <p>{state.message}</p>}
      </form>
    </PopupContainer>
  );
}
