import { getLinks } from "@/actions/getlinks";
import {
  createRelease,
  deleteRelease,
  updateRelease,
} from "@/actions/releases";
import { DialogState } from "@/app/admin/components/release/Releases";
import { Button } from "@/app/ui/Button";
import { ConfirmDialog } from "@/app/ui/Dialogs/ConfirmDialog";
import { FormField } from "@/app/ui/FormField";
import { FormLinks } from "@/app/ui/FormLinks";
import { StatusPopup, useStatus } from "@/app/ui/StatusPopup";
import { StylingContext } from "@/app/ui/StylingProvider";
import { ArtistResponse, Link, Release } from "@/lib/definitions";
import { ReleaseImage } from "@/app/admin/components/release/ReleaseImage";
import { jsonToResult } from "@/lib/utils";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import React, { useContext } from "react";

export const ReleaseForm = ({
  release,
}: {
  release: Release | undefined;
  artist: ArtistResponse;
  isDirty: boolean;
  setDirty: (a: boolean) => void;
  dialog: DialogState;
  setDialog: (a: DialogState) => void;
}) => {
  const styling = useContext(StylingContext);

  const router = useRouter();

  const [status, setStatus] = useStatus();

  return (
    <div
      className={"flex justify-center max-h-full w-full  "}
      style={{
        color: styling.colours.foreground || "",
      }}
    >
      <form
        className={"p-4 h-full flex-col flex w-full  "}
        onSubmit={(e) => e.preventDefault()}
      >
        <FormField
          name="upc"
          label="UPC"
          valueUpdater={getReleaseUpdater("upc")}
          value={editedRelease.upc || ""}
          button={
            <Button
              inline
              secondary
              className="text-xs lg:text-base whitespace-nowrap"
              onClick={async () => {
                posthog.capture("get_links_clicked", {
                  upc: editedRelease.upc,
                });
                const newRelease = jsonToResult(
                  await getLinks(editedRelease.upc),
                );
                setEditedRelease((prev) => {
                  return {
                    ...prev,
                    ...newRelease.get(),
                  } as Release;
                });
              }}
            >
              Get Links...
            </Button>
          }
        />
        <FormField
          name="release-title"
          label="Release Title"
          valueUpdater={getReleaseUpdater("title")}
          value={editedRelease.title}
        />
        <FormField
          name="artist-name"
          label="Artist Name"
          valueUpdater={getReleaseUpdater("artist_name")}
          value={editedRelease.artist_name || ""}
        />
        <div
          className={
            "grid grid-cols-1 lg:grid-cols-[auto_max-content] gap-x-4 grid-flow-row"
          }
        >
          <FormField
            name="release-date"
            label="Release Date"
            valueUpdater={getReleaseUpdater("release_date")}
            value={editedRelease.release_date || ""}
          />
          <FormField
            name="track-count"
            label="Track Count"
            valueUpdater={(value) => {
              const num = parseInt(value);
              getReleaseUpdater("track_count")(num);
            }}
            value={editedRelease.track_count.toString() || ""}
          />
          <FormField
            name="slug"
            label="Slug"
            valueUpdater={getReleaseUpdater("slug")}
            value={editedRelease.slug || ""}
            inactive={!!release?.slug}
            button={
              !release?.slug ? (
                <Button
                  inline
                  secondary
                  className="text-xs lg:text-base whitespace-nowrap"
                  onClick={() => {
                    const slug = editedRelease.title
                      .split(" ")
                      .map(
                        (word) => word.toLowerCase().replace(/[()'"]/g, "")[0],
                      )
                      .join("");

                    getReleaseUpdater("slug")(slug);
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
            name="artist-id"
            label="Artist ID"
            inactive
            valueUpdater={getReleaseUpdater("artist_id")}
            value={editedRelease.artist_id || ""}
          />
          <FormLinks
            valueUpdateAction={getReleaseUpdater("links")}
            links={editedRelease.links || []}
          />
          <ReleaseImage
            editedRelease={editedRelease}
            artworkUpdater={getReleaseUpdater("artwork")}
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
                checked={editedRelease.active}
                className={"mr-4"}
                onChange={(e) => getReleaseUpdater("active")(e.target.checked)}
              />
            </label>
            <Button
              secondary
              name={"delete"}
              className={"mr-4"}
              onClick={async () => {
                if (!editedRelease.slug) {
                  setStatus("Can't delete a release which doesn't exist diva.");
                  return;
                }
                const result = jsonToResult(
                  await deleteRelease(editedRelease.slug),
                );

                if (result.isOk) {
                  posthog.capture("release_deleted", {
                    release_title: editedRelease.title,
                    release_slug: editedRelease.slug,
                    artist_id: editedRelease.artist_id,
                  });
                  setStatus("Successfully deleted release.");
                  dirtyUpdateAction(false);
                } else {
                  setStatus(result.error());
                }
                router.refresh();
              }}
            >
              Delete
            </Button>
            <Button name={"save"} onClick={saveRelease}>
              Save
            </Button>
          </div>
          {dirtyStatus && <p>You have unsaved changes!</p>}
          <StatusPopup status={status} />
        </div>
      </form>
      {dialogSettings.open && (
        <ConfirmDialog
          isOpen={dialogSettings.open}
          onCloseAction={() =>
            dialogSettingsUpdateAction({
              ...dialogSettings,
              open: false,
            })
          }
          title={"You have unsaved changes"}
        ></ConfirmDialog>
      )}
    </div>
  );
};
