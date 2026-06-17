import { DialogPopup } from "@/app/ui/Dialogs/DialogPopup";
import { Button } from "../Button";

export const ConfirmDialog = ({
  isOpen,
  onCloseAction,
  title,
  children,
  onSave,
  onDiscard,
}: {
  isOpen: boolean;
  onCloseAction: () => void;
  title: string;
  onSave: () => void;
  onDiscard: () => void;
  children?: React.ReactNode;
}) => {
  return (
    <DialogPopup isOpen={isOpen} onCloseAction={onCloseAction} title={title}>
      {children || (
        <p>
          You have made changes to this release without saving. Would you like
          to save your changes?
        </p>
      )}

      <div className={"m-4 flex justify-evenly "}>
        <Button secondary onClick={() => onCloseAction()}>
          Cancel
        </Button>
        <Button onClick={() => onDiscard()}>Discard changes</Button>
        <Button onClick={() => onSave()}>Save changes</Button>
      </div>
    </DialogPopup>
  );
};
