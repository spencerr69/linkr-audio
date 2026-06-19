"use client";

import { Button } from "@/app/ui/Button";
import { DialogPopup } from "@/app/ui/Dialogs/DialogPopup";
import { FormField } from "@/app/ui/FormField";
import { applyEmail } from "@/lib/utils";
import { SubmitHandler, useForm } from "react-hook-form";

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
  const { register, handleSubmit } = useForm<ApplyData>();

  const onSubmit: SubmitHandler<ApplyData> = (data) => {
    if (window) {
      window.open(
        `mailto:${applyEmail}?subject=linkr.audio%20Application%20from%20${data.artistName}&body=Artist%20Name%3A%20${data.artistName}%0AArtist%20ID%3A%20${data.artistId}%0AEmail%3A%20${data.email}%0AWebsite%3A%20${data.website}%0AMessage%3A%20${data.message}`,
      );
    }
  };

  return (
    <DialogPopup isOpen={isOpen} onCloseAction={onCloseAction} title={"Apply"}>
      <p>
        You can apply to get your own artist page on linkr.audio. Please note
        that some applications will need to be rejected, as this is intended to
        be a small site. However, the plan is for this site to be made open
        source, so you could potentially self-host your own instance.
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormField
          title={"Artist Name"}
          register={register}
          label={"artistName"}
        />
        <FormField
          title={
            "Artist ID (This will be the subdomain: {id}.linkr.audio/release)"
          }
          register={register}
          label={"artistId"}
        />
        <FormField title={"Email"} register={register} label={"email"} />
        <FormField
          title={"Website (social media or streaming service)"}
          register={register}
          label={"website"}
        />
        <FormField
          title={"Message"}
          type={"text"}
          register={register}
          label={"message"}
        />
        <Button className={"w-sm"} type={"submit"}>
          Apply
        </Button>
      </form>
    </DialogPopup>
  );
};
