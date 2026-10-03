"use client";

import { Button } from "@/app/ui/Button";
import { LoginDialog } from "@/app/ui/Dialogs/LoginDialog";
import { useState } from "react";

export function LoginButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className={"m-2"} onClick={() => { setOpen(!open); }}>
        Log In
      </Button>

      <LoginDialog isOpen={open} onCloseAction={() => { setOpen(!open); }} />
    </>
  );
}
