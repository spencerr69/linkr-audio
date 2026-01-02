"use client";

import { Button } from "@/app/ui/Button";
import { LoginForm } from "@/app/ui/LoginForm";
import { useState } from "react";

export function LoginButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className={"m-2"} onClick={() => setOpen(!open)}>
        Log In
      </Button>

      <LoginForm isOpen={open} onCloseAction={() => setOpen(!open)} />
    </>
  );
}
