import { emptyRelease } from "@/app/admin/components/release/ReleaseForm";
import { DialogSettings } from "@/app/admin/components/release/Releases";
import { DialogPopup } from "@/app/ui/Dialogs/DialogPopup";
import { Release } from "@/lib/definitions";
import { Button } from "../Button";

export const ConfirmDialog = ({
  isOpen,
  onCloseAction,
  title,
  children,
  dialogSettings,
  dialogSettingsUpdateAction,
  dirtyUpdateAction,
  editedReleaseUpdateAction,
  editedRelease,
  releaseChangeAction,
  saveReleaseAction,
}: {
  isOpen: boolean;
  onCloseAction: () => void;
  title: string;
  dialogSettingsUpdateAction: (settings: DialogSettings) => void;
  dialogSettings: DialogSettings;
  dirtyUpdateAction: (b: boolean) => void;
  editedReleaseUpdateAction: (r: Release) => void;
  editedRelease?: Release;
  releaseChangeAction: (r: Release) => void;
  saveReleaseAction: () => Promise<void>;
  children?: React.ReactNode;
}) => {
  return (
    <DialogPopup isOpen={isOpen} onCloseAction={onCloseAction} title={title}>
      <p>
        You have made changes to this release without saving. Would you like to
        save your changes?
      </p>
      {children}
      <div className={"m-4 flex justify-evenly "}>
        <Button
          secondary
          onClick={() =>
            dialogSettingsUpdateAction({
              ...dialogSettings,
              open: false,
            })
          }
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            dirtyUpdateAction(false);
            editedReleaseUpdateAction(
              dialogSettings.newRelease || emptyRelease,
            );
            releaseChangeAction(dialogSettings.newRelease || emptyRelease);
            dialogSettingsUpdateAction({
              newRelease: null,
              oldRelease: null,
              open: false,
            });
          }}
        >
          Discard changes
        </Button>
        <Button
          onClick={async () => {
            if (editedRelease) {
              await saveReleaseAction();
              dirtyUpdateAction(false);
              editedReleaseUpdateAction(
                dialogSettings.newRelease || emptyRelease,
              );
              releaseChangeAction(dialogSettings.newRelease || emptyRelease);
              dialogSettingsUpdateAction({
                newRelease: null,
                oldRelease: null,
                open: false,
              });
            }
          }}
        >
          Save changes
        </Button>
      </div>
    </DialogPopup>
  );
};
