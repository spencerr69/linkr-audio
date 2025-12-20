import { login } from "@/app/actions/auth";
import { useActionState } from "react";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action}>
      <div>
        <label htmlFor="artistid">Artist ID</label>
        <input type="text" name={"artistid"} placeholder={"Artist ID"} />
      </div>
      {state?.errors?.artistid && <p>{state.errors.artistid}</p>}
      <div>
        <label htmlFor="password">Password</label>
        <input type="password" name={"password"} placeholder={"Password"} />
      </div>
      {state?.errors?.password && <p>{state.errors.password}</p>}
      <button disabled={pending} type={"submit"}>
        Log In
      </button>
    </form>
  );
}
