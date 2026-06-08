import { DialogPopup } from "@/app/ui/Dialogs/DialogPopup";

export const ConfirmDialog = ({
  isOpen,
  onCloseAction,
  title,
  children,
}: {
  isOpen: boolean;
  onCloseAction: () => void;
  title: string;
  children?: React.ReactNode;
}) => {
  return (
    <DialogPopup isOpen={isOpen} onCloseAction={onCloseAction} title={title}>
      {children}
    </DialogPopup>
  );
};
