"use client";
import { DialogPopup } from "@/app/ui/Dialogs/DialogPopup";
import React from "react";
import { Button } from "../Button";

export type ConfirmDialogProps = {
  isOpen: boolean;
  onCloseAction: () => void;
  title: string;
  children: React.ReactNode;
  actions: React.ReactNode;
};

export const ConfirmDialog = ({
  isOpen,
  onCloseAction,
  title,
  children,
  actions,
}: ConfirmDialogProps) => {
  return (
    <DialogPopup isOpen={isOpen} onCloseAction={onCloseAction} title={title}>
      {children}

      <div className={"m-4 flex justify-evenly "}>
        <Button
          secondary
          onClick={() => {
            onCloseAction();
          }}
        >
          Cancel
        </Button>
        {actions}
      </div>
    </DialogPopup>
  );
};
