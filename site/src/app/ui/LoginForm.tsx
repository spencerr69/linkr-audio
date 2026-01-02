"use client";

import { login } from "@/app/actions/auth";
import { Button } from "@/app/ui/Button";
import { FormField } from "@/app/ui/FormField";
import { StatusPopup, useStatus } from "@/app/ui/StatusPopup";
import { StylingContext } from "@/app/ui/StylingProvider";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useContext, useState } from "react";

export type LoginData = {
  artist_id: string;
  password: string;
};

export function LoginForm({
  isOpen,
  onCloseAction,
}: {
  isOpen: boolean;
  onCloseAction: (value: boolean) => void;
}) {
  const styling = useContext(StylingContext);

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
    <Dialog
      transition
      open={isOpen}
      onClose={onCloseAction}
      className={"relative z-50 duration-100 "}
    >
      <DialogBackdrop
        transition
        className={
          "duration-200 ease-in-out fixed inset-0 bg-black/15 backdrop-blur-lg data-closed:opacity-0" +
          " data-closed:backdrop-blur-none"
        }
      />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 ">
        <DialogPanel
          transition
          className="rounded-lg max-w-2xl space-y-4 shadow-xl drop-shadow-xl data-closed:opacity-0 duration-200 font-sans text-center p-4"
          style={{
            backgroundColor: styling.colours.background,
            color: styling.colours.foreground,
          }}
        >
          <DialogTitle className="font-bold font-sans text-xl">
            Log In
          </DialogTitle>
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
        </DialogPanel>
        <StatusPopup status={status} />
      </div>
    </Dialog>
  );
}
