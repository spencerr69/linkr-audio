"use client";

import { login } from "@/app/actions/auth";
import { Button } from "@/app/ui/Button";
import { FormField } from "@/app/ui/FormField";
import { StatusPopup, useStatus } from "@/app/ui/StatusPopup";
import { verifySession } from "@/lib/dal";
import { CloseButton, PopoverBackdrop, PopoverPanel } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type LoginData = {
  artist_id: string;
  password: string;
};

export function LoginForm({ open = false }: { open?: boolean }) {
  const router = useRouter();

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

  useEffect(() => {
    const checkIfAuthed = async () => {
      const session = await verifySession();

      if (session.isAuth) {
        router.push("/admin");
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    open && checkIfAuthed();
  }, [open]);

  return (
    <div className={""}>
      <PopoverBackdrop
        className={"fixed inset-0 bg-black/15 backdrop-blur-xl"}
      />
      <PopoverPanel
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          height: "100vh",
          width: "100vw",
          position: "fixed",
          top: "0px",
          left: "0px",
        }}
      >
        <div className={""}>
          <form
            className={
              " text-black flex flex-col items-center w-4xl p-4 bg-white"
            }
          >
            <CloseButton className={"self-end cursor-pointer"}>
              Close
            </CloseButton>
            <FormField
              name={"artist_id"}
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
              className={"m-4"}
              type={"submit"}
              onClick={async (e) => {
                e.preventDefault();
                const result = await login(loginData);
                if (result?.error) {
                  setStatus(result.error);
                }
              }}
            >
              Log In
            </Button>
            <StatusPopup status={status} />
          </form>
        </div>
      </PopoverPanel>
    </div>
  );
}
