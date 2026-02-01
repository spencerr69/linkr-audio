"use client";

import { getLinks } from "@/actions/getlinks";
import {
  createRelease,
  deleteRelease,
  updateRelease,
} from "@/actions/releases";
import { Button } from "@/app/ui/Button";
import { FormField } from "@/app/ui/FormField";
import { FormLinks } from "@/app/ui/FormLinks";
import { StatusPopup, useStatus } from "@/app/ui/StatusPopup";
import { StylingContext } from "@/app/ui/StylingProvider";
import { Link, Release } from "@/lib/definitions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import React, { useContext } from "react";

export const emptyRelease: Release = {
  artwork: "",
  slug: "",
  artist_id: "",
  upc: "",
  title: "",
  release_date: "",
  artist_name: "",
  links: [],
  track_count: 0,
  active: true,
};

export const ReleaseForm = ({ release }: { release?: Release }) => {
  const [editedRelease, setEditedRelease] = React.useState<Release>(
    release || emptyRelease,
  );

  const styling = useContext(StylingContext);

  const router = useRouter();

  const [status, setStatus] = useStatus();

  React.useEffect(() => {
    setEditedRelease(release || emptyRelease);
  }, [release]);

  const getReleaseUpdater = (field: keyof Release) => {
    return (value: string | number | Link[] | boolean) => {
      setEditedRelease((prev) => {
        return {
          ...prev,
          [field]: value,
        } as Release;
      });
    };
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
                const newRelease = await getLinks(editedRelease.upc);
                setEditedRelease((prev) => {
                  return {
                    ...prev,
                    ...newRelease,
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
            valueUpdater={getReleaseUpdater("track_count")}
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
          <div className="flex flex-col items-start mt-8 lg:mt-0">
            <label
              htmlFor="artwork"
              className={" font-light text-sm p-0 m-0"}
              style={{ color: styling.colours.foreground + "AA" }}
            >
              Artwork
            </label>
            <Image
              id={"artwork"}
              src={editedRelease.artwork || "/linkraudio.svg"}
              alt={"Artwork"}
              width={200}
              height={200}
              className={"aspect-square h-fit rounded-md max-w-full "}
            />
          </div>
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
                const result = await deleteRelease(editedRelease);

                if (result.success) {
                  posthog.capture("release_deleted", {
                    release_title: editedRelease.title,
                    release_slug: editedRelease.slug,
                    artist_id: editedRelease.artist_id,
                  });
                  setStatus("Successfully deleted release.");
                } else {
                  setStatus(result.error!);
                }
                router.refresh();
              }}
            >
              Delete
            </Button>
            <Button
              name={"save"}
              onClick={async () => {
                const isUpdate = !!release?.slug;
                const result = isUpdate
                  ? await updateRelease(editedRelease)
                  : await createRelease(editedRelease);
                if (result.success) {
                  posthog.capture(
                    isUpdate ? "release_updated" : "release_created",
                    {
                      release_title: editedRelease.title,
                      release_slug: editedRelease.slug,
                      artist_id: editedRelease.artist_id,
                      track_count: editedRelease.track_count,
                      link_count: editedRelease.links.length,
                    },
                  );
                  setStatus("Successfully saved release.");
                } else {
                  setStatus(result.error!);
                }

                router.refresh();
                return;
              }}
            >
              Save
            </Button>
          </div>
          <StatusPopup status={status} />
        </div>
      </form>
    </div>
  );
};
