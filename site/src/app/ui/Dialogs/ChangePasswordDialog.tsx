import { changePassword, logout } from "@/actions/auth";
import { Button } from "@/app/ui/Button";
import { DialogPopup } from "@/app/ui/Dialogs/DialogPopup";
import { FormField } from "@/app/ui/FormField";
import { useStatus } from "@/app/ui/StatusPopup";
import { jsonToResult } from "@/lib/utils";
import { useForm, SubmitHandler } from "react-hook-form";

export type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
};

export const ChangePasswordDialog = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: (value: boolean) => void;
}) => {
  const [status, setStatus] = useStatus();

  const { register, handleSubmit } = useForm<ChangePasswordData>();

  const onSubmit: SubmitHandler<ChangePasswordData> = async (data) => {
    const attempt = jsonToResult(await changePassword(data));

    if (attempt.isErr) {
      setStatus(attempt.error());
      return;
    }

    setStatus(attempt.get() + " Logging out...");
    setTimeout(() => logout(), 3000);
  };

  return (
    <>
      <DialogPopup
        isOpen={isOpen}
        onCloseAction={onClose}
        title={"Change Password"}
        status={status}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormField
            title={"Current Password"}
            type={"password"}
            register={register}
            label={"currentPassword"}
          />
          <FormField
            title={"New Password"}
            type={"password"}
            register={register}
            label={"newPassword"}
          />
          <Button className={"w-xs mt-4"} type={"submit"}>
            Change Password
          </Button>
        </form>
      </DialogPopup>
    </>
  );
};
