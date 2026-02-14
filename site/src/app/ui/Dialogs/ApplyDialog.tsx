"use client";

import { Button } from "@/app/ui/Button";
import { DialogPopup } from "@/app/ui/Dialogs/DialogPopup";
import { FormField } from "@/app/ui/FormField";
import { applyEmail } from "@/lib/utils";
import { useState } from "react";

export type ApplyData = {
  artistName: string;
  artistId: string;
  email: string;
  website: string;
  message: string;
};

export const ApplyDialog = ({
  isOpen,
  onCloseAction,
}: {
  isOpen: boolean;
  onCloseAction: () => void;
}) => {
  const [applyData, setApplyData] = useState<ApplyData>({
    artistName: "",
    artistId: "",
    email: "",
    website: "",
    message: "",
  });

  const applyDataChanger = (field: keyof ApplyData) => (value: string) => {
    setApplyData((old) => {
      return { ...old, [field]: value } as ApplyData;
    });
  };

  return (
    <DialogPopup isOpen={isOpen} onCloseAction={onCloseAction} title={"Apply"}>
      <p>
        You can apply to get your own artist page on linkr.audio. Please note
        that some applications will need to be rejected, as this is intended to
        be a small site. However, the plan is for this site to be made open
        source, so you could potentially self-host your own instance.
      </p>
      <form>
        <FormField
          label={"Artist Name"}
          name={"artist-name"}
          value={applyData.artistName}
          valueUpdater={applyDataChanger("artistName")}
        />
        <FormField
          label={
            "Artist ID (This will be the subdomain: {id}.linkr.audio/release)"
          }
          name={"artist-id"}
          value={applyData.artistId}
          valueUpdater={applyDataChanger("artistId")}
        />
        <FormField
          label={"Email"}
          name={"email"}
          value={applyData.email}
          valueUpdater={applyDataChanger("email")}
        />
        <FormField
          label={"Website (social media or streaming service)"}
          name={"website"}
          value={applyData.website}
          valueUpdater={applyDataChanger("website")}
        />
        <FormField
          label={"Message"}
          name={"message"}
          type={"text"}
          value={applyData.message}
          valueUpdater={applyDataChanger("message")}
        />
        <Button
          className={"w-sm"}
          type={"submit"}
          onClick={(e) => {
            e.preventDefault();

            if (window) {
              window.open(
                `mailto:${applyEmail}?subject=linkr.audio%20Application%20from%20${applyData.artistName}&body=Artist%20Name%3A%20${applyData.artistName}%0AArtist%20ID%3A%20${applyData.artistId}%0AEmail%3A%20${applyData.email}%0AWebsite%3A%20${applyData.website}%0AMessage%3A%20${applyData.message}`,
              );
            }
          }}
        >
          Apply
        </Button>
      </form>
    </DialogPopup>
  );
};
