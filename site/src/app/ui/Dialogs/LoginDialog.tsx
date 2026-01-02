"use client";

import { login } from "@/app/actions/auth";
import { Button } from "@/app/ui/Button";
import { DialogPopup } from "@/app/ui/Dialogs/DialogPopup";
import { FormField } from "@/app/ui/FormField";
import { useStatus } from "@/app/ui/StatusPopup";
import { useState } from "react";

export type LoginData = {
  artist_id: string;
  password: string;
};

export function LoginDialog({
  isOpen,
  onCloseAction,
}: {
  isOpen: boolean;
  onCloseAction: (value: boolean) => void;
}) {
  const [loginData, setLoginData] = useState<LoginData>({
    artist_id: "",
    password: "",
  });

  const [status, setStatus] = useStatus();

  const loginDataChanger = (field: keyof LoginData) => (value: string) => {
    setLoginData((old) => {
      return {
        ...old,
        [field]: value,
      } as LoginData;
    });
  };

  return (
    <DialogPopup
      isOpen={isOpen}
      onCloseAction={onCloseAction}
      title={"Log In"}
      status={status}
    >
      <form>
        <FormField
          name={"artist-id"}
          label={"Artist ID"}
          value={loginData.artist_id}
          valueUpdater={loginDataChanger("artist_id")}
        />
        <FormField
          name={"password"}
          label={"Password"}
          type={"password"}
          value={loginData.password}
          valueUpdater={loginDataChanger("password")}
        />
        <Button
          className={"w-xs mt-4"}
          type={"submit"}
          onClick={async (e) => {
            e.preventDefault();

            const attempt = await login(loginData);

            if (!attempt.success) {
              setStatus(attempt.error || "");
              return;
            }

            setStatus("Logging in...");
          }}
        >
          Log In
        </Button>
      </form>
    </DialogPopup>
  );
}
