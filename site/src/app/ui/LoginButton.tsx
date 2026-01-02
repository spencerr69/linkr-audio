"use client";

import { Button } from "@/app/ui/Button";
import { LoginForm } from "@/app/ui/LoginForm";
import { Popover, PopoverButton } from "@headlessui/react";

export function LoginButton() {
  return (
    <Popover>
      {({ open }) => (
        <>
          <PopoverButton as={Button} className={"m-2"}>
            Log In
          </PopoverButton>

          <LoginForm open={open} />
        </>
      )}
    </Popover>
  );
}
