import {
  createRelease,
  deleteRelease,
  updateRelease,
} from "@/actions/releases";
import { ReleaseImage } from "@/app/admin/components/release/ReleaseImage";
import { DialogState } from "@/app/admin/components/release/Releases";
import { Button } from "@/app/ui/Button";
import { ConfirmDialog } from "@/app/ui/Dialogs/ConfirmDialog";
import { FormField } from "@/app/ui/FormField";
import { FormLinks } from "@/app/ui/FormLinks";
import { StylingContext } from "@/app/ui/StylingProvider";
import { ArtistResponse, Release, releaseFormSchema } from "@/lib/definitions";
import { components } from "@/lib/schema";
import { jsonToResult } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useContext, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

interface ReleaseFormInput {
  upc: string;
  title: string;
  artist_name: string;
  release_date: string;
  artwork: string;
  links: components["schemas"]["Link"][];
  artist_id: string;
  slug: string;
  active: boolean;
  track_count: number;
}

const slugify = (input: string) => {
  return input
    .split(" ")
    .map((word) => word.toLowerCase().replace(/[()'"]/g, "")[0])
    .join("");
};

const releaseToReleaseForm = (
  { artwork, artist_id, slug, ...release }: Release,
  artistId: string,
): Partial<ReleaseFormInput> => {
  return {
    artwork: artwork || "",
    artist_id: artist_id || artistId,
    slug: slug || "",
    ...release,
  };
};

export const ReleaseForm = ({
  release,
  artist,
  dialog,
  setDirty,
  setDialog,
  createReleaseForm,
}: {
  release: Release | undefined;
  artist: ArtistResponse;
  isDirty: boolean;
  setDirty: (a: boolean) => void;
  dialog: DialogState;
  setDialog: (a: DialogState) => void;
  createReleaseForm: (slug: string, b?: boolean) => void;
}) => {
  const styling = useContext(StylingContext);

  const {
    control,
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors, isDirty },
    trigger,
  } = useForm<ReleaseFormInput>({
    defaultValues: release
      ? releaseToReleaseForm(release, artist.artist_id)
      : { artist_id: artist.artist_id },
    resolver: zodResolver(releaseFormSchema),
  });
  const router = useRouter();

  useEffect(() => {
    setDirty(isDirty);
  }, [isDirty, setDirty]);

  const onSubmit: SubmitHandler<ReleaseFormInput> = async (data) => {
    const result = jsonToResult(
      release ? await updateRelease(data) : await createRelease(data),
    );
    if (result.isErr) {
      toast(result.error());
    } else {
      router.refresh();
      toast(`Release ${release ? "updated" : "created"}!`);
    }
  };

  return (
    <div
      className={"flex justify-center max-h-full w-full  "}
      style={{
        color: styling.colours.foreground || "",
      }}
    >
      <form
        className={"p-4 h-full flex-col flex w-full  "}
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormField
          title={"UPC"}
          label="upc"
          required
          register={register}
          button={
            <>
              {/*  Get Links button would be here if that still worked! thank u spotify for needing premium for
             your api now... */}
            </>
          }
        />
        <FormField
          title={"Release Title"}
          required
          label="title"
          register={register}
        />
        <FormField
          title="Artist Name"
          label={"artist_name"}
          required
          register={register}
        />
        <div
          className={
            "grid grid-cols-1 lg:grid-cols-[auto_max-content] gap-x-4 p-0 m-0 grid-flow-row"
          }
        >
          <FormField
            title="Release Date"
            register={register}
            label={"release_date"}
            button={<p>{errors.release_date?.message}</p>}
          />

          <FormField
            title="Track Count"
            type={"number"}
            register={register}
            label={"track_count"}
            button={<p>{errors.track_count?.message}</p>}
          />
          <FormField
            title="Slug"
            register={register}
            label={"slug"}
            required
            inactive={release !== undefined}
            button={
              release === undefined ? (
                <Button
                  inline
                  secondary
                  className="text-xs lg:text-base whitespace-nowrap"
                  onClick={() => {
                    setValue("slug", slugify(getValues("title")));
                  }}
                >
                  Generate...
                </Button>
              ) : (
                <></>
              )
            }
          />
          <FormField
            title="Artist ID"
            register={register}
            label={"artist_id"}
            inactive
          />
          <FormLinks name={"links"} register={register} control={control} />
          <ReleaseImage
            slug={getValues("slug")}
            artist_id={getValues("artist_id")}
            name={"artwork"}
            title={"title"}
            getValues={getValues}
            setValue={setValue}
          />
        </div>
        <div className="saveContainer flex-col flex items-center lg:items-end my-12">
          <div>
            <label
              className={" font-light text-sm p-0 m-0"}
              style={{ color: styling.colours.foreground + "AA" }}
            >
              Active{" "}
              <input
                type={"checkbox"}
                {...register("active")}
                className={"mr-4"}
              />
            </label>
            {release !== undefined && (
              <Button
                secondary
                name={"delete"}
                className={"mr-4"}
                onClick={async () => {
                  const result = jsonToResult(
                    await deleteRelease(release.slug!),
                  );

                  if (result.isOk) {
                    posthog.capture("release_deleted", {
                      release_title: release.title,
                      release_slug: release.slug,
                      artist_id: release.artist_id,
                    });
                    toast("Successfully deleted release.");
                  } else {
                    toast(result.error());
                  }
                  router.refresh();
                }}
              >
                Delete
              </Button>
            )}
            <Button type="submit" name={"save"}>
              Save
            </Button>
          </div>
          {isDirty && <p>You have unsaved changes!</p>}
        </div>
      </form>
      {dialog?.type === "confirm" && (
        <ConfirmDialog
          title={"You have unsaved changes"}
          isOpen={dialog?.type === "confirm"}
          onCloseAction={() => setDialog(null)}
          onSave={async () => {
            const isValid = await trigger();
            if (isValid) {
              await handleSubmit(onSubmit)();
              setDialog(null);
              createReleaseForm(dialog.nextSlug, true);
            }
          }}
          onDiscard={() => {
            setDialog(null);
            createReleaseForm(dialog.nextSlug, true);
          }}
        ></ConfirmDialog>
      )}
    </div>
  );
};
