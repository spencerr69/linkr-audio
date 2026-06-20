import { getImageUploadURL } from "@/actions/images";
import { StylingContext } from "@/app/ui/StylingProvider";
import { Button } from "@/app/ui/Button";
import Image from "next/image";
import { useContext } from "react";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  FieldValues,
  Path,
  UseFormGetValues,
  UseFormSetValue,
} from "react-hook-form";
import { toast } from "sonner";

export type ReleaseImageProps<FormType extends FieldValues> = {
  getValues: UseFormGetValues<FormType>;
  setValue: UseFormSetValue<FormType>;
  name: Path<FormType>;
  title: Path<FormType>;
  artist_id: string;
  slug: string;
};

export function ReleaseImage<FormType extends FieldValues>({
  getValues,
  setValue,
  name,
  title,
  artist_id,
  slug,
}: ReleaseImageProps<FormType>) {
  const styling = useContext(StylingContext);

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
      {getValues(name) ? (
        <>
          <Image
            id={"artwork"}
            src={getValues(name)}
            alt={`Artwork of ${getValues(title)}`}
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
              // @ts-expect-error hmm
              setValue(name, undefined);
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

              const key = `${artist_id}-${slug}-${new Date().toISOString().replaceAll(/[-:.TZ]/g, "")}.${image.name.split(".")[1]}`;

              const url = await getImageUploadURL(key);

              const upload = await uploadImage(url, image);

              if (!upload.success) {
                toast(upload.error || "Failed to upload.");
                return;
              }

              toast("Upload successful!");

              // @ts-expect-error hmm
              setValue(name, `https://linkr.audio/images?image=${upload.key}`);
              return;
            }}
            name={"artwork"}
            accept={"image/*"}
            multiple={false}
          />
        </div>
      )}
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
