"use client";

import { getImageUploadURL } from "@/actions/images";
import { StatusPopup, useStatus } from "@/app/ui/StatusPopup";
import { StylingContext } from "@/app/ui/StylingProvider";
import { Release } from "@/lib/definitions";
import { Button } from "@/app/ui/Button";
import Image from "next/image";
import { useContext } from "react";
import RemoveIcon from "@mui/icons-material/Remove";

export function ReleaseImage(props: {
  editedRelease: Release;
  // @ts-expect-error idk why it has issues here
  artworkUpdater: (params: (typeof Release)[keyof typeof Release]) => void;
}) {
  const styling = useContext(StylingContext);

  const [status, setStatus] = useStatus();

  return (
    <div
      // key={props.editedRelease.artwork || ""}
      className="flex flex-col relative items-start mt-8 lg:mt-0"
    >
      <label
        htmlFor="artwork"
        className={" font-light text-sm p-0 m-0"}
        style={{ color: styling.colours.foreground + "AA" }}
      >
        Artwork
      </label>
      {props.editedRelease.artwork ? (
        <>
          <Image
            id={"artwork"}
            src={props.editedRelease.artwork}
            alt={`Artwork of ${props.editedRelease.title}`}
            width={200}
            height={200}
            quality={75}
            className={"aspect-square h-fit rounded-md max-w-full "}
          />
          <Button
            inline
            secondary
            squish
            className={"absolute top-1 right-0 m-0 scale-75"}
            onClick={() => {
              props.artworkUpdater(null);
            }}
          >
            <RemoveIcon />
          </Button>
        </>
      ) : (
        <div
          className={
            "w-[200px] h-[200px] aspect-square rounded-md  p-2 border-dashed border-2 flex flex-col justify-center" +
            " items-center content-center justify-self-center text-center"
          }
          style={{
            backgroundColor: `${styling.colours.background}`,
          }}
        >
          <style>
            {`
            input[type="file"]::file-selector-button:hover {
              background: ${styling.colours.background};
              color: ${styling.colours.accent};
            }
            
            input[type="file"]::file-selector-button {
              display: flex;
              align-items: center;
              justify-content: center;
              align-self: center;
              justify-self: center;
              background: ${styling.colours.accent};
              color: ${styling.colours.background};
              border-radius: 3px;
              cursor: pointer;
              padding: 2px 1em;
              border-color: ${styling.colours.accent};
              border-width: 2px;
              transition: 0.2s;
            `}
          </style>
          <input
            type="file"
            className={"text-sm w-full text-center"}
            style={{
              color: styling.colours.foreground,
            }}
            onChange={async (e) => {
              console.log(e.currentTarget.files);

              if (e.currentTarget.files?.length != 1) {
                return;
              }

              const image = e.currentTarget.files[0] as File;

              console.log(image);

              if (!image) {
                return;
              }

              const key = `${props.editedRelease.artist_id}-${props.editedRelease.slug}-${new Date().toISOString().replaceAll(/[-:.TZ]/g, "")}.${image.name.split(".")[1]}`;

              const url = await getImageUploadURL(key);

              const upload = await uploadImage(url, image);

              if (!upload.success) {
                setStatus(upload.error || "Failed to upload.");
                return;
              }

              setStatus("Upload successful!");

              props.artworkUpdater(
                `https://linkr.audio/images?image=${upload.key}`,
              );
              return;
            }}
            name={"artwork"}
            accept={"image/*"}
            multiple={false}
          />
        </div>
      )}
      <StatusPopup status={status} />
    </div>
  );
}
const uploadImage = async (uploadUrl: string, image: File) => {
  const data = new FormData();

  data.append("imageFile", image);

  const req = await fetch(uploadUrl, {
    method: "POST",
    body: data,
  });

  if (!req.ok) {
    return {
      success: false,
      error: "Could not upload image.",
    };
  }

  const body = await req.text();

  console.log(`Uploaded! ${body}`);

  return {
    success: true,
    key: body.split("?"),
  };
};
