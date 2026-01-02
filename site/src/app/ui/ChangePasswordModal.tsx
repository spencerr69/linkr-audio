import { changePassword, logout } from "@/app/actions/auth";
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

export type ChangePasswordData = {
  currentPassword: string;
  newPassword: string;
};

export const ChangePasswordModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: (value: boolean) => void;
}) => {
  const styling = useContext(StylingContext);

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
      <Dialog
        transition
        open={isOpen}
        onClose={onClose}
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
              Change Password
            </DialogTitle>
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
          </DialogPanel>
          <StatusPopup status={status} />
        </div>
      </Dialog>
    </>
  );
};
