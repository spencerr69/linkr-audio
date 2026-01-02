"use client";

import { StatusPopup, StatusState } from "@/app/ui/StatusPopup";
import { StylingContext } from "@/app/ui/StylingProvider";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useContext } from "react";

type DialogPopupProps = {
  isOpen: boolean;
  onCloseAction: (value: boolean) => void;
  title: string;
  children: React.ReactNode;
  status?: StatusState;
};
export const DialogPopup = ({
  isOpen,
  onCloseAction,
  title,
  children,
  status,
}: DialogPopupProps) => {
  const styling = useContext(StylingContext);

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
          "duration-200 ease-in-out fixed inset-0 bg-black/25 backdrop-blur-lg data-closed:opacity-0" +
          " data-closed:backdrop-blur-none"
        }
      />
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 ">
        <DialogPanel
          transition
          className="rounded-lg max-w-2xl space-y-4 shadow-xl drop-shadow-xl shadow-black/30  data-closed:opacity-0 duration-200 font-sans text-center p-4"
          style={{
            backgroundColor: styling.colours.background,
            color: styling.colours.foreground,
          }}
        >
          <DialogTitle className="font-bold font-sans text-xl">
            {title}
          </DialogTitle>
          {children}
        </DialogPanel>
        {status && <StatusPopup status={status} />}
      </div>
    </Dialog>
  );
};
