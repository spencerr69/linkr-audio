"use client";

import { changePassword, logout } from "@/actions/auth";
import { Button } from "@/app/ui/Button";
import { DialogPopup } from "@/app/ui/Dialogs/DialogPopup";
import { FormField } from "@/app/ui/FormField";
import { useStatus } from "@/app/ui/StatusPopup";
import { useState } from "react";

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

  const [changePasswordData, setChangePasswordData] =
    useState<ChangePasswordData>({
      currentPassword: "",
      newPassword: "",
    });

  const changePasswordDataUpdater =
    (key: keyof ChangePasswordData) => (value: string) => {
      setChangePasswordData((data) => ({
        ...data,
        [key]: value,
      }));
    };

  return (
    <>
      <DialogPopup
        isOpen={isOpen}
        onCloseAction={onClose}
        title={"Change Password"}
        status={status}
      >
        <form>
          <FormField
            name={"currentPassword"}
            label={"Current Password"}
            type={"password"}
            value={changePasswordData.currentPassword}
            valueUpdater={changePasswordDataUpdater("currentPassword")}
          />
          <FormField
            name={"newPassword"}
            label={"New Password"}
            type={"password"}
            value={changePasswordData.newPassword}
            valueUpdater={changePasswordDataUpdater("newPassword")}
          />
          <Button
            className={"w-xs mt-4"}
            type={"submit"}
            onClick={async (e) => {
              e.preventDefault();

              const attempt = await changePassword(changePasswordData);

              if (!attempt.success) {
                setStatus(attempt.message);
                return;
              }

              setStatus(attempt.message + " Logging out...");
              setTimeout(() => logout(), 3000);
            }}
          >
            Change Password
          </Button>
        </form>
      </DialogPopup>
    </>
  );
};
