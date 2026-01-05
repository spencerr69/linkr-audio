import { getImageUploadURL } from "@/app/actions/images";
import { StylingContext } from "@/app/ui/StylingProvider";
import { Release } from "@/lib/definitions";
import { Button } from "@/app/ui/Button";
import Image from "next/image";
import React, { useContext, useEffect, useRef, useState } from "react";

export function ReleaseImage(props: { editedRelease: Release }) {
  const styling = useContext(StylingContext);
  const [uploadUrl, setUploadUrl] = useState("");

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
              setUploadUrl(
                await getImageUploadURL(
                  `${props.editedRelease.artist_id}-${props.editedRelease.slug}`,
                ),
              );
            }}
          >
            Wig
          </Button>
          <input type="file" alt={"artwork"} id={"artwork"} />
        </div>
      )}
    </div>
  );
}
