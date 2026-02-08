import { getImageUploadURL, uploadImage } from "@/actions/images";
import { StatusPopup, useStatus } from "@/app/ui/StatusPopup";
import { StylingContext } from "@/app/ui/StylingProvider";
import { Release } from "@/lib/definitions";
import { Button } from "@/app/ui/Button";
import Image from "next/image";
import { useContext, useState } from "react";

export function ReleaseImage(props: {
  editedRelease: Release;
  artworkUpdater: (newData: string) => void;
}) {
  const styling = useContext(StylingContext);
  const [uploadUrl, setUploadUrl] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [status, setStatus] = useStatus();

  return (
    <div className="flex flex-col items-start mt-8 lg:mt-0">
      <label
        htmlFor="artwork"
        className={" font-light text-sm p-0 m-0"}
        style={{ color: styling.colours.foreground + "AA" }}
      >
        Artwork
      </label>
      {props.editedRelease.artwork ? (
        <Image
          id={"artwork"}
          src={props.editedRelease.artwork}
          alt={"Artwork"}
          width={200}
          height={200}
          className={"aspect-square h-fit rounded-md max-w-full "}
        />
      ) : (
        <div
          className={"w-[200px] h-[200px] max-w-full rounded-md aspect-square"}
          style={{
            backgroundColor: `${styling.colours.foreground}AA`,
          }}
        >
          <Button
            onClick={async () => {
              if (!image) {
                setStatus("Image not found.");
                return;
              }

              let key = `${props.editedRelease.artist_id}-${props.editedRelease.slug}-${new Date().toISOString()}`;

              key = key.replaceAll(/[-:.TZ]/g, "");

              setUploadUrl(await getImageUploadURL(key));

              const upload = await uploadImage(uploadUrl, image);

              if (!upload.success) {
                setStatus(upload.error || "Failed to upload.");
                return;
              }

              setStatus("Upload successful!");

              props.artworkUpdater(
                `https://linkr.audio/images?image=${upload.key}`,
              );
            }}
          >
            Wig
          </Button>
          <input
            type="file"
            alt={"artwork"}
            id={"artwork"}
            onInput={(e) => {
              if (e.currentTarget.files?.length != 1) {
                return;
              }

              setImage(e.currentTarget.files[0] as File);
            }}
          />
        </div>
      )}
      <StatusPopup status={status} />
    </div>
  );
}
