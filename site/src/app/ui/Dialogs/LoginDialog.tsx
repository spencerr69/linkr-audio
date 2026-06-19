"use client";

import { login } from "@/actions/auth";
import { Button } from "@/app/ui/Button";
import { DialogPopup } from "@/app/ui/Dialogs/DialogPopup";
import { FormField } from "@/app/ui/FormField";
import { useStatus } from "@/app/ui/StatusPopup";
import { jsonToResult } from "@/lib/utils";
import { SubmitHandler, useForm } from "react-hook-form";

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
  const { register, handleSubmit } = useForm<LoginData>();

  const [status, setStatus] = useStatus();

  const onSubmit: SubmitHandler<LoginData> = async (data) => {
    const attempt = jsonToResult(await login(data));

    if (attempt.isErr) {
      setStatus(attempt.error());
      return;
    }

    setStatus("Logging in...");
  };

  return (
    <DialogPopup
      isOpen={isOpen}
      onCloseAction={onCloseAction}
      title={"Log In"}
      status={status}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          title={"Artist ID"}
          register={register}
          label={"artist_id"}
        />
        <FormField
          title={"Password"}
          type={"password"}
          register={register}
          label={"password"}
        />
        <Button className={"w-xs mt-4"} type={"submit"}>
          Log In
        </Button>
      </form>
    </DialogPopup>
  );
}
